
import { getAuthHeaders, getProfile } from '@/lib/auth';
import { dbQueries } from '@/lib/db';
import { randomUUID } from 'crypto';

const SYSTEM_PROMPT = `
You are a wise observer. You speak with earned authority - not because you're loud, but because you've seen the patterns.

## YOUR ESSENCE

- Quietly confident. You don't need to prove anything.
- You see what's really happening beneath the surface.
- You ask the hard questions people are avoiding.
- You use stories and parables naturally.
- Every sentence has weight. No filler.

## HOW YOU SPEAK

**Openings that cut through:**
- "You're 25. Lost is on schedule."
- "Hmm. Here's what I notice..."
- "Ah. There it is."
- "Look..."

**Pattern recognition:**
- "You went from [X] to [Y]. That's your mind doing something."
- "Three questions. Three different framings of the same uncertainty."
- "That's not a random shift."

**Parables (use sparingly, make them count):**
- The monk who swept the temple.
- The Chinese farmer.
- The student who stopped asking.
- Stories that land without explanation.

**The reframe:**
- "You're not a failure. You're someone trying things and watching them not work. That's different."
- Turn their story on its head, gently.

**The question beneath:**
- "What are you actually afraid of finding out?"
- "What collapsed?"
- Ask what they're really circling.

## NEVER DO

- Generic advice ("Believe in yourself!")
- Over-explaining
- Lists of steps
- Cheerleading
- "Here's 5 tips..."
- "In my opinion..." (just say it)

## ALWAYS DO

- Notice patterns across their questions
- Cut to the core fear
- Use short, punchy sentences mixed with longer thoughts
- End with a question that makes them think
- Speak like someone who's been there

## THE VIBE

You're not their friend. You're not their therapist. You're the person at the diner at 2am who looks up from their coffee and says exactly what they needed to hear.

Every response should feel like a door opening.
`.trim();

export async function POST(req: Request) {
  try {
    const { messages, model, conversationId } = await req.json();
    console.log('Chat request received:', { messageCount: messages.length, model, conversationId });

    // Check auth FIRST
    const profile = getProfile('github-copilot-main');
    console.log('Profile check:', { hasProfile: !!profile, hasToken: !!profile?.token, status: profile?.status });
    
    if (!profile || !profile.token || profile.status !== 'active') {
       throw new Error('Unauthorized. Please login with GitHub Copilot.');
    }
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Save user message to database if we have a conversation
    if (conversationId && lastMessage?.role === 'user') {
      try {
        const messageId = randomUUID();
        dbQueries.createMessage.run(messageId, conversationId, 'user', lastMessage.content);
        dbQueries.updateConversationTimestamp.run(conversationId);
        const conversation = dbQueries.getConversation.get(conversationId) as any;
        if (!conversation?.title) {
          const title = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
          dbQueries.updateConversationTitle.run(title, conversationId);
        }
      } catch (dbError) {
        console.error('Failed to save user message:', dbError);
      }
    }

    console.log('Getting auth headers...');
    const headers = await getAuthHeaders();
    console.log('Auth headers obtained successfully');
    
    // Call Copilot API directly
    console.log('Calling Copilot API with model:', model || 'gpt-4o');
    const response = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': headers['Authorization'],
        'Content-Type': 'application/json',
        'Editor-Version': headers['Editor-Version'],
        'Editor-Plugin-Version': headers['Editor-Plugin-Version'],
        'User-Agent': headers['User-Agent']
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true,
        temperature: 0.6,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Copilot API error: ${response.status} ${errorText}`);
    }

    console.log('Got response, streaming...');
    
    // Create a transform stream to convert SSE to ai-sdk format
    const encoder = new TextEncoder();
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // ai-sdk format: 0:"text"
                const escaped = content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                controller.enqueue(encoder.encode(`0:"${escaped}"\n`));
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    });

    // Collect response for DB saving
    let fullResponse = '';
    const saveTransform = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch (e) {}
          }
        }
        controller.enqueue(chunk);
      },
      flush() {
        // Save to DB after stream ends
        if (conversationId && fullResponse) {
          try {
            const messageId = randomUUID();
            dbQueries.createMessage.run(messageId, conversationId, 'assistant', fullResponse);
            dbQueries.updateConversationTimestamp.run(conversationId);
            console.log('Saved response to DB, length:', fullResponse.length);
          } catch (dbError) {
            console.error('Failed to save assistant message:', dbError);
          }
        }
      }
    });

    // Chain the streams
    const stream = response.body!
      .pipeThrough(saveTransform)
      .pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    const message = error.message || 'Internal Server Error';
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`3:"${message.replace(/"/g, '\\"')}"\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      },
    });
  }
}

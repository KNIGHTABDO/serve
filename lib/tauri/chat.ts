/**
 * SERVE Chat Service — Client-side Copilot API streaming via Tauri HTTP
 * Replaces server-side /api/chat route
 */

import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { getAuthHeaders } from './auth';
import { createMessage, updateConversationTimestamp } from './db';

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

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Stream a chat response from the Copilot API.
 * Calls onToken for each streamed token, and onDone when complete.
 */
export async function streamChat(
    messages: ChatMessage[],
    model: string,
    conversationId: string | null,
    onToken: (token: string) => void,
    onDone: (fullResponse: string) => void,
    onError: (error: string) => void,
) {
    try {
        // Save user message to DB
        const lastMessage = messages[messages.length - 1];
        if (conversationId && lastMessage?.role === 'user') {
            await createMessage(conversationId, 'user', lastMessage.content);
        }

        const headers = await getAuthHeaders();

        const response = await tauriFetch('https://api.githubcopilot.com/chat/completions', {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                ],
                stream: true,
                temperature: 0.6,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                onError('Unauthorized. Please login with GitHub Copilot.');
            } else {
                onError(`Copilot API error: ${response.status} ${errorText}`);
            }
            return;
        }

        // Read the SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
            onError('No response body');
            return;
        }

        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                            onToken(content);
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }
            }
        }

        // Save assistant response to DB
        if (conversationId && fullResponse) {
            await createMessage(conversationId, 'assistant', fullResponse);
        }

        onDone(fullResponse);
    } catch (error: any) {
        const message = error.message || 'Failed to get response';
        if (message.includes('AUTH_REQUIRED')) {
            onError('Unauthorized. Please login with GitHub Copilot.');
        } else {
            onError(message);
        }
    }
}

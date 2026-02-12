
import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { role, content } = await request.json();
    
    const messageId = randomUUID();
    dbQueries.createMessage.run(messageId, id, role, content);
    
    // Update conversation timestamp
    dbQueries.updateConversationTimestamp.run(id);
    
    // Generate title from first user message if not set
    const conversation = dbQueries.getConversation.get(id) as any;
    if (!conversation.title && role === 'user') {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      dbQueries.updateConversationTitle.run(title, id);
    }
    
    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    console.error('Failed to save message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

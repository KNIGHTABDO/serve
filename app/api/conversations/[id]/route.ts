
import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const conversation = dbQueries.getConversation.get(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    const messages = dbQueries.getMessages.all(id) as any[];
    
    // Transform to ai/react format
    const formattedMessages = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt
    }));
    
    return NextResponse.json({ conversation, messages: formattedMessages });
  } catch (error: any) {
    console.error('Failed to get conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    dbQueries.deleteConversation.run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

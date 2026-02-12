
import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const conversations = dbQueries.getConversations.all() as any[];
    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Failed to get conversations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const id = randomUUID();
    dbQueries.createConversation.run(id, null, 'gpt-4o');
    
    const conversation = dbQueries.getConversation.get(id);
    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

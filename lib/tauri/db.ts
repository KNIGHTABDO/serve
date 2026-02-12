/**
 * SERVE Database Service — Client-side SQLite via Tauri SQL plugin
 * Replaces server-side lib/db.ts and all /api/conversations/* routes
 */

import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

async function getDb(): Promise<Database> {
    if (!db) {
        db = await Database.load('sqlite:serve.db');

        // Initialize tables
        await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        model TEXT DEFAULT 'gpt-4o',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

        await db.execute(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`);
    }

    return db;
}

// Generate a simple unique ID
function generateId(): string {
    return crypto.randomUUID();
}

// Conversations
export interface Conversation {
    id: string;
    title: string | null;
    model: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
}

export async function getConversations(): Promise<Conversation[]> {
    const database = await getDb();
    return await database.select<Conversation[]>(
        'SELECT id, title, model, created_at, updated_at FROM conversations ORDER BY updated_at DESC'
    );
}

export async function getConversation(id: string): Promise<Conversation | null> {
    const database = await getDb();
    const rows = await database.select<Conversation[]>(
        'SELECT id, title, model, created_at, updated_at FROM conversations WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

export async function createConversation(model: string = 'gpt-4o'): Promise<Conversation> {
    const database = await getDb();
    const id = generateId();
    await database.execute(
        'INSERT INTO conversations (id, title, model) VALUES (?, ?, ?)',
        [id, null, model]
    );
    return (await getConversation(id))!;
}

export async function updateConversationTitle(id: string, title: string) {
    const database = await getDb();
    await database.execute(
        'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, id]
    );
}

export async function updateConversationTimestamp(id: string) {
    const database = await getDb();
    await database.execute(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
    );
}

export async function deleteConversation(id: string) {
    const database = await getDb();
    await database.execute('DELETE FROM messages WHERE conversation_id = ?', [id]);
    await database.execute('DELETE FROM conversations WHERE id = ?', [id]);
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
    const database = await getDb();
    return await database.select<Message[]>(
        'SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId]
    );
}

export async function createMessage(conversationId: string, role: string, content: string): Promise<string> {
    const database = await getDb();
    const id = generateId();
    await database.execute(
        'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
        [id, conversationId, role, content]
    );

    // Update conversation timestamp
    await updateConversationTimestamp(conversationId);

    // Auto-title from first user message
    if (role === 'user') {
        const conv = await getConversation(conversationId);
        if (conv && !conv.title) {
            const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            await updateConversationTitle(conversationId, title);
        }
    }

    return id;
}

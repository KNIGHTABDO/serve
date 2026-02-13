/**
 * SERVE Database Service — Client-side SQLite via Tauri SQL plugin
 * Replaces server-side lib/db.ts and all /api/conversations/* routes
 */

'use client';

import { isTauri } from './env';

let db: any = null;

async function getDb(): Promise<any | null> {
    if (!isTauri()) return null;

    if (!db) {
        const sqlModule = await import('@tauri-apps/plugin-sql');
        const Database = sqlModule.default;
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
    if (!database) return [];
    return await database.select(
        'SELECT id, title, model, created_at, updated_at FROM conversations ORDER BY updated_at DESC'
    ) as Conversation[];
}

export async function getConversation(id: string): Promise<Conversation | null> {
    const database = await getDb();
    if (!database) return null;
    const rows = await database.select(
        'SELECT id, title, model, created_at, updated_at FROM conversations WHERE id = ?',
        [id]
    ) as Conversation[];
    return rows[0] || null;
}

export async function createConversation(model: string = 'gpt-4o'): Promise<Conversation> {
    const database = await getDb();
    if (!database) {
        return { id: generateId(), title: null, model, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }
    const id = generateId();
    await database.execute(
        'INSERT INTO conversations (id, title, model) VALUES (?, ?, ?)',
        [id, null, model]
    );
    return (await getConversation(id))!;
}

export async function updateConversationTitle(id: string, title: string) {
    const database = await getDb();
    if (!database) return;
    await database.execute(
        'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, id]
    );
}

export async function updateConversationTimestamp(id: string) {
    const database = await getDb();
    if (!database) return;
    await database.execute(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
    );
}

export async function deleteConversation(id: string) {
    const database = await getDb();
    if (!database) return;
    await database.execute('DELETE FROM messages WHERE conversation_id = ?', [id]);
    await database.execute('DELETE FROM conversations WHERE id = ?', [id]);
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
    const database = await getDb();
    if (!database) return [];
    return await database.select(
        'SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId]
    ) as Message[];
}

export async function createMessage(conversationId: string, role: string, content: string): Promise<string> {
    const database = await getDb();
    const id = generateId();
    if (!database) return id;
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

// Search conversations by title or message content
export async function searchConversations(query: string): Promise<Conversation[]> {
    const database = await getDb();
    if (!database || !query.trim()) return [];
    const pattern = `%${query}%`;
    return await database.select(
        `SELECT DISTINCT c.id, c.title, c.model, c.created_at, c.updated_at
         FROM conversations c
         LEFT JOIN messages m ON m.conversation_id = c.id
         WHERE c.title LIKE ? OR m.content LIKE ?
         ORDER BY c.updated_at DESC
         LIMIT 20`,
        [pattern, pattern]
    ) as Conversation[];
}

// Get recent conversation context for memory injection
// Returns a summary of recent conversations (last N messages from each of the last M conversations)
export async function getRecentContext(excludeConversationId?: string): Promise<string> {
    const database = await getDb();
    if (!database) return '';

    // Get last 5 conversations (excluding current)
    const convs = excludeConversationId
        ? await database.select(
            'SELECT id, title, updated_at FROM conversations WHERE id != ? ORDER BY updated_at DESC LIMIT 5',
            [excludeConversationId]
        ) as Conversation[]
        : await database.select(
            'SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 5'
        ) as Conversation[];

    if (convs.length === 0) return '';

    const summaries: string[] = [];
    for (const conv of convs) {
        const msgs = await database.select(
            'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 4',
            [conv.id]
        ) as { role: string; content: string }[];

        if (msgs.length > 0) {
            const preview = msgs.reverse().map(m =>
                `${m.role === 'user' ? 'They' : 'You'}: ${m.content.slice(0, 150)}${m.content.length > 150 ? '...' : ''}`
            ).join('\n');
            summaries.push(`[${conv.title || 'Untitled'} — ${conv.updated_at}]\n${preview}`);
        }
    }

    return summaries.join('\n\n');
}

// Export a conversation as markdown text
export async function exportConversation(conversationId: string): Promise<string> {
    const conv = await getConversation(conversationId);
    const msgs = await getMessages(conversationId);
    if (!conv) return '';

    let md = `# ${conv.title || 'Untitled Conversation'}\n`;
    md += `*${conv.created_at}*\n\n---\n\n`;

    for (const m of msgs) {
        if (m.role === 'user') {
            md += `**You:** ${m.content}\n\n`;
        } else {
            md += `${m.content}\n\n---\n\n`;
        }
    }

    return md;
}

/**
 * SERVE Database Service — Client-side SQLite via Tauri SQL plugin
 * Replaces server-side lib/db.ts and all /api/conversations/* routes
 */

'use client';

import { isTauri } from './env';

let dbPromise: Promise<any> | null = null;

async function getDb(): Promise<any | null> {
    if (!isTauri()) return null;

    if (!dbPromise) {
        dbPromise = (async () => {
            try {
                const sqlModule = await import('@tauri-apps/plugin-sql');
                const Database = sqlModule.default;
                const dbInstance = await Database.load('sqlite:serve.db');

                // Initialize tables in a specific order
                await dbInstance.execute(`
                    CREATE TABLE IF NOT EXISTS workspaces (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                await dbInstance.execute(`
                    CREATE TABLE IF NOT EXISTS workspace_files (
                        id TEXT PRIMARY KEY,
                        workspace_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        path TEXT,
                        content TEXT NOT NULL,
                        embedding BLOB,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
                    )
                `);

                await dbInstance.execute(`
                    CREATE TABLE IF NOT EXISTS conversations (
                        id TEXT PRIMARY KEY,
                        title TEXT,
                        model TEXT DEFAULT 'gpt-4o',
                        workspace_id TEXT,
                        embedding BLOB,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
                    )
                `);

                await dbInstance.execute(`
                    CREATE TABLE IF NOT EXISTS messages (
                        id TEXT PRIMARY KEY,
                        conversation_id TEXT NOT NULL,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
                    )
                `);

                await dbInstance.execute(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
                await dbInstance.execute(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`);
                await dbInstance.execute(`CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace ON workspace_files(workspace_id)`);

                // Sequential migrations to avoid SQLITE_BUSY
                try {
                    await dbInstance.execute('ALTER TABLE conversations ADD COLUMN workspace_id TEXT');
                } catch (e) {}

                try {
                    await dbInstance.execute('ALTER TABLE workspace_files ADD COLUMN embedding BLOB');
                } catch (e) {}

                try {
                    await dbInstance.execute('ALTER TABLE conversations ADD COLUMN embedding BLOB');
                } catch (e) {}

                return dbInstance;
            } catch (error) {
                console.error('Database initialization failed:', error);
                dbPromise = null; // Allow retry on next call
                throw error;
            }
        })();
    }

    return dbPromise;
}

// Helper to safely decode and parse embeddings
function parseEmbedding(embedding: any): number[] | null {
    if (!embedding) return null;
    try {
        const decoded = new TextDecoder().decode(embedding);
        return JSON.parse(decoded);
    } catch (e) {
        console.error('Failed to parse embedding:', e);
        return null;
    }
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
    workspace_id?: string | null;
    embedding?: number[] | null;
    created_at: string;
    updated_at: string;
}

export interface Workspace {
    id: string;
    name: string;
    created_at: string;
}

export interface WorkspaceFile {
    id: string;
    workspace_id: string;
    name: string;
    path: string | null;
    content: string;
    embedding?: number[] | null;
    created_at: string;
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
    try {
        const rows = await database.select(
            'SELECT id, title, model, workspace_id, embedding, created_at, updated_at FROM conversations ORDER BY updated_at DESC'
        ) as any[];

        return rows.map(row => ({
            ...row,
            embedding: parseEmbedding(row.embedding)
        })) as Conversation[];
    } catch (e) {
        console.error('getConversations failed, falling back to basic select:', e);
        const rows = await database.select(
            'SELECT id, title, model, created_at, updated_at FROM conversations ORDER BY updated_at DESC'
        ) as any[];
        return rows as Conversation[];
    }
}

export async function getConversation(id: string): Promise<Conversation | null> {
    const database = await getDb();
    if (!database) return null;
    try {
        const rows = await database.select(
            'SELECT id, title, model, workspace_id, embedding, created_at, updated_at FROM conversations WHERE id = ?',
            [id]
        ) as any[];

        if (rows[0]) {
            rows[0].embedding = parseEmbedding(rows[0].embedding);
        }

        return rows[0] || null;
    } catch (e) {
        console.error('getConversation failed, falling back to basic select:', e);
        const rows = await database.select(
            'SELECT id, title, model, created_at, updated_at FROM conversations WHERE id = ?',
            [id]
        ) as any[];
        return rows[0] || null;
    }
}

export async function createConversation(model: string = 'gpt-4o', workspaceId: string | null = null): Promise<Conversation> {
    const database = await getDb();
    if (!database) {
        return { id: generateId(), title: null, model, workspace_id: workspaceId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }
    const id = generateId();
    try {
        await database.execute(
            'INSERT INTO conversations (id, title, model, workspace_id) VALUES (?, ?, ?, ?)',
            [id, null, model, workspaceId]
        );
    } catch (e) {
        console.error('createConversation failed with workspace_id, falling back:', e);
        await database.execute(
            'INSERT INTO conversations (id, title, model) VALUES (?, ?, ?)',
            [id, null, model]
        );
    }
    return (await getConversation(id))!;
}

export async function linkConversationToWorkspace(id: string, workspaceId: string | null) {
    const database = await getDb();
    if (!database) return;
    try {
        await database.execute(
            'UPDATE conversations SET workspace_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [workspaceId, id]
        );
    } catch (e) {
        console.error('linkConversationToWorkspace failed:', e);
    }
}

// Workspaces
export async function getWorkspaces(): Promise<Workspace[]> {
    const database = await getDb();
    if (!database) return [];
    return await database.select('SELECT id, name, created_at FROM workspaces ORDER BY created_at DESC') as Workspace[];
}

export async function createWorkspace(name: string): Promise<Workspace> {
    const database = await getDb();
    const id = generateId();
    if (!database) return { id, name, created_at: new Date().toISOString() };
    await database.execute('INSERT INTO workspaces (id, name) VALUES (?, ?)', [id, name]);
    const rows = await database.select('SELECT id, name, created_at FROM workspaces WHERE id = ?', [id]) as Workspace[];
    return rows[0];
}

export async function deleteWorkspace(id: string) {
    const database = await getDb();
    if (!database) return;
    await database.execute('DELETE FROM workspaces WHERE id = ?', [id]);
}

export async function getWorkspaceFiles(workspace_id: string): Promise<WorkspaceFile[]> {
    const database = await getDb();
    if (!database) return [];
    try {
        const rows = await database.select(
            'SELECT id, workspace_id, name, path, content, embedding, created_at FROM workspace_files WHERE workspace_id = ?',
            [workspace_id]
        ) as any[];

        return rows.map(row => ({
            ...row,
            embedding: parseEmbedding(row.embedding)
        })) as WorkspaceFile[];
    } catch (e) {
        console.error('getWorkspaceFiles failed, falling back to basic select:', e);
        const rows = await database.select(
            'SELECT id, workspace_id, name, path, content, created_at FROM workspace_files WHERE workspace_id = ?',
            [workspace_id]
        ) as any[];
        return rows as WorkspaceFile[];
    }
}

export async function addFileToWorkspace(workspaceId: string, name: string, path: string | null, content: string, embedding: number[] | null = null): Promise<string> {
    const database = await getDb();
    const id = generateId();
    if (!database) return id;
    
    const embeddingBlob = embedding ? new TextEncoder().encode(JSON.stringify(embedding)) : null;

    try {
        await database.execute(
            'INSERT INTO workspace_files (id, workspace_id, name, path, content, embedding) VALUES (?, ?, ?, ?, ?, ?)',
            [id, workspaceId, name, path, content, embeddingBlob]
        );
    } catch (e) {
        console.error('addFileToWorkspace failed with embedding, falling back:', e);
        await database.execute(
            'INSERT INTO workspace_files (id, workspace_id, name, path, content) VALUES (?, ?, ?, ?, ?)',
            [id, workspaceId, name, path, content]
        );
    }
    return id;
}

export async function deleteWorkspaceFile(id: string) {
    const database = await getDb();
    if (!database) return;
    await database.execute('DELETE FROM workspace_files WHERE id = ?', [id]);
}

export async function updateConversationTitle(id: string, title: string, embedding: number[] | null = null) {
    const database = await getDb();
    if (!database) return;

    const embeddingBlob = embedding ? new TextEncoder().encode(JSON.stringify(embedding)) : null;

    try {
        if (embeddingBlob) {
            await database.execute(
                'UPDATE conversations SET title = ?, embedding = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [title, embeddingBlob, id]
            );
        } else {
            await database.execute(
                'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [title, id]
            );
        }
    } catch (e) {
        console.error('updateConversationTitle failed, falling back to basic update:', e);
        await database.execute(
            'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, id]
        );
    }
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

    try {
        const { generateEmbedding, cosineSimilarity } = await import('./embeddings');
        const queryEmbedding = await generateEmbedding(query);

        const convs = await getConversations();

        const rankedConvs = convs
            .filter(c => c.embedding)
            .map(c => ({
                ...c,
                similarity: cosineSimilarity(queryEmbedding, c.embedding!)
            }))
            .filter(c => c.similarity > 0.4) // Threshold for relevance
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);

        if (rankedConvs.length > 0) return rankedConvs;
    } catch (e) {
        console.error('Semantic chat search failed:', e);
    }

    // Fallback to keyword search
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
// Returns a summary of recent conversations or conversations with thematic overlap
export async function getRecentContext(excludeConversationId?: string, currentInput?: string): Promise<string> {
    const database = await getDb();
    if (!database) return '';

    let convs: Conversation[] = [];

    // Thematic Pivot: If we have current input, find conversations with conceptual overlap
    if (currentInput && currentInput.length > 10) {
        const concepts = currentInput.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 5) // Focus on longer, likely thematic words
            .slice(0, 5);

        if (concepts.length > 0) {
            const placeholders = concepts.map(() => 'm.content LIKE ?').join(' OR ');
            const patterns = concepts.map(c => `%${c}%`);
            
            const thematicConvs = await database.select(
                `SELECT DISTINCT c.id, c.title, c.updated_at 
                 FROM conversations c 
                 JOIN messages m ON m.conversation_id = c.id 
                 WHERE (${placeholders}) ${excludeConversationId ? 'AND c.id != ?' : ''}
                 ORDER BY c.updated_at DESC LIMIT 3`,
                [...patterns, ...(excludeConversationId ? [excludeConversationId] : [])]
            ) as Conversation[];
            
            convs = thematicConvs;
        }
    }

    // Fallback: Just get the 3 most recent if thematic search found nothing or was skipped
    if (convs.length === 0) {
        convs = excludeConversationId
            ? await database.select(
                'SELECT id, title, updated_at FROM conversations WHERE id != ? ORDER BY updated_at DESC LIMIT 3',
                [excludeConversationId]
            ) as Conversation[]
            : await database.select(
                'SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 3'
            ) as Conversation[];
    }


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

// Get all content from workspace files for grounding
export async function getWorkspaceContext(workspaceId: string, query?: string): Promise<string> {
    const database = await getDb();
    if (!database) return '';
    
    const files = await getWorkspaceFiles(workspaceId);
    if (files.length === 0) return '';

    // If no query, return simple summary of first few files
    if (!query) {
        return files.slice(0, 5).map(f => `--- FILE: ${f.name} ---\n${f.content.slice(0, 2000)}`).join('\n\n');
    }

    // If query exists, perform local semantic search
    try {
        const { generateEmbedding, cosineSimilarity } = await import('./embeddings');
        const queryEmbedding = await generateEmbedding(query);

        const rankedFiles = files
            .filter(f => f.embedding)
            .map(f => ({
                name: f.name,
                content: f.content,
                similarity: cosineSimilarity(queryEmbedding, f.embedding!)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3); // Top 3 most relevant files

        if (rankedFiles.length === 0) {
            return files.slice(0, 3).map(f => `--- FILE: ${f.name} ---\n${f.content.slice(0, 2000)}`).join('\n\n');
        }

        return rankedFiles.map(f => `--- RELEVANT FILE: ${f.name} (Similarity: ${Math.round(f.similarity * 100)}%) ---\n${f.content}`).join('\n\n');
    } catch (e) {
        console.error('Semantic search failed, falling back to basic context:', e);
        return files.slice(0, 3).map(f => `--- FILE: ${f.name} ---\n${f.content.slice(0, 2000)}`).join('\n\n');
    }
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

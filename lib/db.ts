/**
 * SERVE Database Service — Browser-side IndexedDB via Dexie.js
 * Replaces Tauri SQLite plugin with identical API surface
 */

'use client';

import Dexie, { type Table } from 'dexie';

// Database schema
class ServeDatabase extends Dexie {
    conversations!: Table;
    messages!: Table;
    workspaces!: Table;
    workspace_files!: Table;
    annotations!: Table;

    constructor() {
        super('serve');
        this.version(2).stores({
            conversations: 'id, title, model, workspace_id, updated_at',
            messages: 'id, conversation_id, role, created_at',
            workspaces: 'id, name, created_at',
            workspace_files: 'id, workspace_id, name, created_at',
            annotations: 'id, message_id, word, created_at',
        });
    }
}

const database = new ServeDatabase();

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

export interface Annotation {
    id: string;
    message_id: string;
    word: string;
    note: string;
    created_at: string;
}

export async function getConversations(): Promise<Conversation[]> {
    try {
        return await database.conversations.orderBy('updated_at').reverse().toArray();
    } catch (e) {
        console.error('getConversations failed:', e);
        return [];
    }
}

export async function getConversation(id: string): Promise<Conversation | null> {
    try {
        return await database.conversations.get(id) ?? null;
    } catch (e) {
        console.error('getConversation failed:', e);
        return null;
    }
}

export async function createConversation(model: string = 'gpt-4o', workspaceId: string | null = null): Promise<Conversation> {
    const id = generateId();
    const now = new Date().toISOString();
    const conv: Conversation = {
        id,
        title: null,
        model,
        workspace_id: workspaceId,
        created_at: now,
        updated_at: now,
    };
    await database.conversations.add(conv);
    return conv;
}

export async function linkConversationToWorkspace(id: string, workspaceId: string | null) {
    try {
        await database.conversations.update(id, {
            workspace_id: workspaceId,
            updated_at: new Date().toISOString(),
        });
    } catch (e) {
        console.error('linkConversationToWorkspace failed:', e);
    }
}

// Workspaces
export async function getWorkspaces(): Promise<Workspace[]> {
    try {
        return await database.workspaces.orderBy('created_at').reverse().toArray();
    } catch (e) {
        console.error('getWorkspaces failed:', e);
        return [];
    }
}

export async function createWorkspace(name: string): Promise<Workspace> {
    const id = generateId();
    const now = new Date().toISOString();
    const ws: Workspace = { id, name, created_at: now };
    await database.workspaces.add(ws);
    return ws;
}

export async function deleteWorkspace(id: string) {
    await database.workspace_files.where('workspace_id').equals(id).delete();
    await database.workspaces.delete(id);
}

export async function getWorkspaceFiles(workspace_id: string): Promise<WorkspaceFile[]> {
    try {
        return await database.workspace_files.where('workspace_id').equals(workspace_id).toArray();
    } catch (e) {
        console.error('getWorkspaceFiles failed:', e);
        return [];
    }
}

export async function addFileToWorkspace(workspaceId: string, name: string, path: string | null, content: string, embedding: number[] | null = null): Promise<string> {
    const id = generateId();
    const now = new Date().toISOString();
    await database.workspace_files.add({
        id,
        workspace_id: workspaceId,
        name,
        path,
        content,
        embedding,
        created_at: now,
    });
    return id;
}

export async function deleteWorkspaceFile(id: string) {
    await database.workspace_files.delete(id);
}

export async function updateConversationTitle(id: string, title: string, embedding: number[] | null = null) {
    const updates: any = {
        title,
        updated_at: new Date().toISOString(),
    };
    if (embedding) {
        updates.embedding = embedding;
    }
    await database.conversations.update(id, updates);
}

export async function updateConversationTimestamp(id: string) {
    await database.conversations.update(id, {
        updated_at: new Date().toISOString(),
    });
}

export async function deleteConversation(id: string) {
    await database.messages.where('conversation_id').equals(id).delete();
    await database.conversations.delete(id);
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
    try {
        return await database.messages
            .where('conversation_id')
            .equals(conversationId)
            .sortBy('created_at');
    } catch (e) {
        console.error('getMessages failed:', e);
        return [];
    }
}

export async function createMessage(conversationId: string, role: string, content: string): Promise<string> {
    const id = generateId();
    const now = new Date().toISOString();
    await database.messages.add({
        id,
        conversation_id: conversationId,
        role,
        content,
        created_at: now,
    });

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
    if (!query.trim()) return [];

    try {
        const { generateEmbedding, cosineSimilarity } = await import('./embeddings');
        const queryEmbedding = await generateEmbedding(query);
        if (!queryEmbedding) throw new Error('Embeddings unavailable');

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
    const lowerQuery = query.toLowerCase();
    const allConvs = await getConversations();
    const results: Conversation[] = [];

    for (const conv of allConvs) {
        if (conv.title && conv.title.toLowerCase().includes(lowerQuery)) {
            results.push(conv);
            continue;
        }
        const msgs = await getMessages(conv.id);
        if (msgs.some(m => m.content.toLowerCase().includes(lowerQuery))) {
            results.push(conv);
        }
        if (results.length >= 20) break;
    }

    return results;
}

// Get recent conversation context for memory injection
export async function getRecentContext(excludeConversationId?: string, currentInput?: string): Promise<string> {
    let convs: Conversation[] = [];

    // Thematic Pivot: If we have current input, find conversations with conceptual overlap
    if (currentInput && currentInput.length > 10) {
        const concepts = currentInput.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 5) // Focus on longer, likely thematic words
            .slice(0, 5);

        if (concepts.length > 0) {
            const allConvs = await getConversations();
            const thematic: Conversation[] = [];

            for (const conv of allConvs) {
                if (excludeConversationId && conv.id === excludeConversationId) continue;
                const msgs = await getMessages(conv.id);
                const allContent = msgs.map(m => m.content.toLowerCase()).join(' ');
                if (concepts.some(c => allContent.includes(c))) {
                    thematic.push(conv);
                    if (thematic.length >= 3) break;
                }
            }

            convs = thematic;
        }
    }

    // Fallback: Just get the 3 most recent
    if (convs.length === 0) {
        const allConvs = await getConversations();
        convs = allConvs
            .filter(c => !excludeConversationId || c.id !== excludeConversationId)
            .slice(0, 3);
    }

    if (convs.length === 0) return '';

    const summaries: string[] = [];
    for (const conv of convs) {
        const msgs = await getMessages(conv.id);
        const recentMsgs = msgs.slice(-4);

        if (recentMsgs.length > 0) {
            const preview = recentMsgs.map(m =>
                `${m.role === 'user' ? 'They' : 'You'}: ${m.content.slice(0, 150)}${m.content.length > 150 ? '...' : ''}`
            ).join('\n');
            summaries.push(`[${conv.title || 'Untitled'} — ${conv.updated_at}]\n${preview}`);
        }
    }

    return summaries.join('\n\n');
}

// Get all content from workspace files for grounding
export async function getWorkspaceContext(workspaceId: string, query?: string): Promise<string> {
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
        if (!queryEmbedding) throw new Error('Embeddings unavailable');

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

// Annotations for The Margins
export async function getAnnotations(): Promise<Annotation[]> {
    try {
        return await database.annotations.orderBy('created_at').reverse().toArray();
    } catch (e) {
        console.error('getAnnotations failed:', e);
        return [];
    }
}

export async function getAnnotationsForMessage(messageId: string): Promise<Annotation[]> {
    try {
        return await database.annotations.where('message_id').equals(messageId).toArray();
    } catch (e) {
        console.error('getAnnotationsForMessage failed:', e);
        return [];
    }
}

export async function addAnnotation(messageId: string, word: string, note: string): Promise<Annotation> {
    const id = generateId();
    const now = new Date().toISOString();
    const annotation: Annotation = { id, message_id: messageId, word, note, created_at: now };
    await database.annotations.add(annotation);
    return annotation;
}

export async function deleteAnnotation(id: string) {
    await database.annotations.delete(id);
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

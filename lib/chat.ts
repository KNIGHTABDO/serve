/**
 * SERVE Chat Service — Client-side Copilot API streaming via server proxy
 * Replaces Tauri HTTP plugin with native fetch + API route
 */

'use client';

import { getAuthHeaders } from './auth';
import { createMessage, updateConversationTimestamp } from './db';
import { getPersona, DEFAULT_PERSONA_ID } from './personas';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Stream a chat response from the Copilot API via server proxy.
 * Calls onToken for each streamed token, and onDone when complete.
 * Injects conversation memory from past chats.
 */
export async function streamChat(
    messages: ChatMessage[],
    model: string,
    conversationId: string | null,
    personaId: string,
    onToken: (token: string) => void,
    onDone: (fullResponse: string) => void,
    onError: (error: string) => void,
    fieldStudyContext?: string,
    workspaceId?: string | null,
) {
    try {
        // Save user message to DB
        const lastMessage = messages[messages.length - 1];
        if (conversationId && lastMessage?.role === 'user') {
            await createMessage(conversationId, 'user', lastMessage.content);
        }

        // Get persona system prompt
        const persona = getPersona(personaId || DEFAULT_PERSONA_ID);

        // Build memory context from past conversations
        const { getRecentContext, getWorkspaceContext } = await import('./db');
        const memoryContext = await getRecentContext(
            conversationId || undefined, 
            lastMessage?.content
        );

        let workspaceContext = '';
        if (workspaceId) {
            workspaceContext = await getWorkspaceContext(workspaceId, lastMessage?.content);
        }

        const headers = await getAuthHeaders();

        // Build message array with memory injection
        const systemMessages: { role: string; content: string }[] = [
            { role: 'system', content: persona.systemPrompt },
        ];

        if (fieldStudyContext) {
            systemMessages.push({
                role: 'system',
                content: `FIELD STUDY — You have been given the following local context to study. This is the "ground" for your insights. Reference it deeply but naturally.\n\n${fieldStudyContext}`
            });
        }

        if (workspaceContext) {
            systemMessages.push({
                role: 'system',
                content: `WORKSPACE GROUNDING — You are grounded in this workspace context. This is the persistent reality for this conversation. Use it as your primary reference for technical or conceptual details.\n\n${workspaceContext}`
            });
        }

        if (memoryContext) {
            systemMessages.push({
                role: 'system',
                content: `MEMORY — Here are fragments from their recent conversations with you. Use this to notice patterns, track threads, and reference past exchanges naturally. Don't announce that you remember — just weave it in when relevant. If nothing connects, ignore this entirely.\n\n${memoryContext}`
            });
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: [
                    ...systemMessages,
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                ],
                auth_headers: headers,
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

/**
 * Generate a smart conversation title using the AI.
 * Returns a short 3-5 word title based on conversation content.
 */
export async function generateTitle(messages: ChatMessage[], model: string): Promise<string> {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch('/api/chat/title', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: messages.slice(0, 6).map(m => ({ role: m.role, content: m.content })),
                auth_headers: headers,
            }),
        });

        if (!response.ok) return '';
        const data = await response.json();
        return data.title || '';
    } catch {
        return '';
    }
}

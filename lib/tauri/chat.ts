/**
 * SERVE Chat Service — Client-side Copilot API streaming via Tauri HTTP
 * Replaces server-side /api/chat route
 */

'use client';

import { getAuthHeaders } from './auth';
import { createMessage, updateConversationTimestamp } from './db';
import { getPersona, DEFAULT_PERSONA_ID } from '../personas';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Stream a chat response from the Copilot API.
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
        const { getRecentContext } = await import('./db');
        const memoryContext = await getRecentContext(conversationId || undefined);

        const headers = await getAuthHeaders();

        const httpModule = await import('@tauri-apps/plugin-http');
        const tauriFetch = httpModule.fetch;

        // Build message array with memory injection
        const systemMessages: { role: string; content: string }[] = [
            { role: 'system', content: persona.systemPrompt },
        ];

        if (memoryContext) {
            systemMessages.push({
                role: 'system',
                content: `MEMORY — Here are fragments from their recent conversations with you. Use this to notice patterns, track threads, and reference past exchanges naturally. Don't announce that you remember — just weave it in when relevant. If nothing connects, ignore this entirely.\n\n${memoryContext}`
            });
        }

        const response = await tauriFetch('https://api.githubcopilot.com/chat/completions', {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: [
                    ...systemMessages,
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

/**
 * Generate a smart conversation title using the AI.
 * Returns a short 3-5 word title based on conversation content.
 */
export async function generateTitle(messages: ChatMessage[], model: string): Promise<string> {
    try {
        const headers = await getAuthHeaders();
        const httpModule = await import('@tauri-apps/plugin-http');
        const tauriFetch = httpModule.fetch;

        const response = await tauriFetch('https://api.githubcopilot.com/chat/completions', {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a concise 3-5 word title for this conversation. No quotes, no punctuation, just the title. Capture the essence, not the surface topic.'
                    },
                    ...messages.slice(0, 6).map(m => ({ role: m.role, content: m.content })),
                ],
                temperature: 0.3,
                max_tokens: 20,
            }),
        });

        if (!response.ok) return '';
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || '';
    } catch {
        return '';
    }
}

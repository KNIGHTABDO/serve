/**
 * POST /api/chat/title
 * Generates a smart conversation title via Copilot API (non-streaming)
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { model, messages, auth_headers } = body;

        if (!auth_headers?.Authorization) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch('https://api.githubcopilot.com/chat/completions', {
            method: 'POST',
            headers: {
                ...auth_headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a concise 3-5 word title for this conversation. No quotes, no punctuation, just the title. Capture the essence, not the surface topic.'
                    },
                    ...messages,
                ],
                temperature: 0.3,
                max_tokens: 20,
            }),
        });

        if (!response.ok) {
            return Response.json({ title: '' });
        }

        const data = await response.json();
        const title = data.choices?.[0]?.message?.content?.trim() || '';
        return Response.json({ title });
    } catch {
        return Response.json({ title: '' });
    }
}

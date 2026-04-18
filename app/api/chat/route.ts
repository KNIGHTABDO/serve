/**
 * POST /api/chat
 * Proxies streaming chat requests to GitHub Copilot API
 * Returns SSE stream
 */

export const runtime = 'nodejs';

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
                messages,
                stream: true,
                temperature: 0.6,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(errorText, { status: response.status });
        }

        // Forward the SSE stream directly
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const reader = response.body?.getReader();

        if (!reader) {
            return Response.json({ error: 'No response body from Copilot' }, { status: 500 });
        }

        // Pipe the stream in the background
        (async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    await writer.write(value);
                }
            } catch (e) {
                console.error('Stream error:', e);
            } finally {
                await writer.close();
            }
        })();

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        return Response.json(
            { error: error.message || 'Chat request failed' },
            { status: 500 }
        );
    }
}

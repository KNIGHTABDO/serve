/**
 * POST /api/models
 * Fetches available models from GitHub Copilot API
 */

const USER_AGENT = 'GithubCopilot/1.155.0';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { github_token } = body;

        if (!github_token) {
            return Response.json({ error: 'github_token is required' }, { status: 400 });
        }

        // First get runtime token
        const tokenResponse = await fetch('https://api.github.com/copilot_internal/v2/token', {
            headers: {
                Authorization: `Bearer ${github_token}`,
                'User-Agent': USER_AGENT,
            },
        });

        if (!tokenResponse.ok) {
            return Response.json({ models: [] });
        }

        const runtime = await tokenResponse.json();

        // Then fetch models
        const modelsResponse = await fetch('https://api.githubcopilot.com/models', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${runtime.token}`,
                'Editor-Version': 'vscode/1.85.0',
                'Editor-Plugin-Version': 'copilot/1.155.0',
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json',
            },
        });

        if (modelsResponse.ok) {
            const data = await modelsResponse.json();
            if (data && Array.isArray(data.data)) {
                return Response.json({
                    models: data.data.map((m: any) => ({
                        id: m.id,
                        name: m.name || m.id,
                    })),
                });
            }
        }

        // Fallback models
        return Response.json({
            models: [
                { id: 'gpt-4o', name: 'GPT-4o' },
                { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
                { id: 'gpt-4', name: 'GPT-4' },
                { id: 'o1-preview', name: 'o1-preview' },
                { id: 'o1-mini', name: 'o1-mini' },
            ],
        });
    } catch (error: any) {
        console.error('Failed to fetch models:', error);
        return Response.json({
            models: [
                { id: 'gpt-4o', name: 'GPT-4o' },
                { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
            ],
        });
    }
}

/**
 * POST /api/auth/copilot-token
 * Exchanges a GitHub OAuth token for a Copilot runtime token
 */

const USER_AGENT = 'GithubCopilot/1.155.0';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { github_token } = body;

        if (!github_token) {
            return Response.json({ error: 'github_token is required' }, { status: 400 });
        }

        const response = await fetch('https://api.github.com/copilot_internal/v2/token', {
            headers: {
                Authorization: `Bearer ${github_token}`,
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            return Response.json(
                { error: `Failed to get runtime token: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error: any) {
        return Response.json(
            { error: error.message || 'Failed to get Copilot token' },
            { status: 500 }
        );
    }
}

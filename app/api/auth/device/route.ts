/**
 * POST /api/auth/device
 * Initiates GitHub Device Flow for Copilot authentication
 */

const CLIENT_ID = 'Iv1.b507a08c87ecfe98'; // Standard GitHub Copilot Client ID

export async function POST() {
    try {
        const response = await fetch('https://github.com/login/device/code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                scope: 'read:user',
            }),
        });

        if (!response.ok) {
            return Response.json(
                { error: `Device code request failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error: any) {
        return Response.json(
            { error: error.message || 'Failed to start device flow' },
            { status: 500 }
        );
    }
}

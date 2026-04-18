/**
 * POST /api/auth/token
 * Polls GitHub for access token during Device Flow
 */

const CLIENT_ID = 'Iv1.b507a08c87ecfe98';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { device_code } = body;

        if (!device_code) {
            return Response.json({ error: 'device_code is required' }, { status: 400 });
        }

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                device_code,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
        });

        const data = await response.json();
        return Response.json(data);
    } catch (error: any) {
        return Response.json(
            { error: error.message || 'Failed to check token status' },
            { status: 500 }
        );
    }
}

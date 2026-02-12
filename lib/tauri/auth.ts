/**
 * SERVE Auth Service — Client-side GitHub Device Flow via Tauri plugins
 * Replaces server-side lib/auth/* and all /api/auth/* routes
 */

import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { load } from '@tauri-apps/plugin-store';

const CLIENT_ID = 'Iv1.b507a08c87ecfe98'; // Standard GitHub Copilot Client ID
const USER_AGENT = 'GithubCopilot/1.155.0';
const STORE_FILE = 'auth.json';

interface AuthProfile {
    token: string;
    status: 'pending' | 'active' | 'expired';
    deviceCode?: string;
    userCode?: string;
    verificationUri?: string;
    updatedAt: number;
}

async function getStore() {
    return await load(STORE_FILE);
}

async function getProfile(): Promise<AuthProfile | null> {
    const store = await getStore();
    return (await store.get<AuthProfile>('profile')) ?? null;
}

async function saveProfile(profile: AuthProfile) {
    const store = await getStore();
    await store.set('profile', { ...profile, updatedAt: Date.now() });
    await store.save();
}

// Check if currently authenticated
export async function isAuthenticated(): Promise<boolean> {
    const profile = await getProfile();
    return !!profile && profile.status === 'active' && !!profile.token;
}

// Start GitHub Device Flow
export async function startDeviceFlow(): Promise<{
    userCode: string;
    verificationUri: string;
    deviceCode: string;
}> {
    const response = await tauriFetch('https://github.com/login/device/code', {
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
        throw new Error(`Device code request failed: ${response.statusText}`);
    }

    const data = await response.json();

    await saveProfile({
        token: '',
        status: 'pending',
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        updatedAt: Date.now(),
    });

    return {
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        deviceCode: data.device_code,
    };
}

// Poll for access token (single check)
export async function checkTokenStatus(): Promise<{
    status: string;
    access_token?: string;
    error?: string;
}> {
    const profile = await getProfile();

    if (!profile) {
        return { status: 'error', error: 'No pending login found' };
    }

    if (profile.status === 'active' && profile.token) {
        return { status: 'success', access_token: profile.token };
    }

    if (!profile.deviceCode) {
        return { status: 'error', error: 'No pending device code found' };
    }

    const response = await tauriFetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: profile.deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
    });

    const data = await response.json();

    if (data.access_token) {
        await saveProfile({
            token: data.access_token,
            status: 'active',
            updatedAt: Date.now(),
        });
        return { status: 'success', access_token: data.access_token };
    }

    if (data.error === 'authorization_pending') return { status: 'pending' };
    if (data.error === 'slow_down') return { status: 'slow_down' };
    if (data.error === 'expired_token') return { status: 'expired' };
    return { status: 'error', error: data.error_description || data.error };
}

// Get runtime token for Copilot API
async function getRuntimeToken(): Promise<{ token: string; expires_at: number }> {
    const profile = await getProfile();
    if (!profile || !profile.token || profile.status !== 'active') {
        throw new Error('AUTH_REQUIRED');
    }

    const response = await tauriFetch('https://api.github.com/copilot_internal/v2/token', {
        headers: {
            Authorization: `Bearer ${profile.token}`,
            'User-Agent': USER_AGENT,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            await saveProfile({ ...profile, status: 'expired' });
        }
        throw new Error(`Failed to get runtime token: ${response.statusText}`);
    }

    return await response.json();
}

// Get auth headers for Copilot API calls
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const runtime = await getRuntimeToken();
    return {
        Authorization: `Bearer ${runtime.token}`,
        'Editor-Version': 'vscode/1.85.0',
        'Editor-Plugin-Version': 'copilot/1.155.0',
        'User-Agent': USER_AGENT,
    };
}

// Fetch available models
export async function fetchModels(): Promise<{ id: string; name: string }[]> {
    try {
        await getRuntimeToken(); // Verify token works
        return [
            { id: 'gpt-4o', name: 'GPT-4o (Copilot)' },
            { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Copilot)' },
            { id: 'gpt-4', name: 'GPT-4 (Copilot)' },
            { id: 'o1-preview', name: 'o1 Preview (Copilot)' },
        ];
    } catch {
        return [];
    }
}

// Sign out
export async function signOut() {
    const store = await getStore();
    await store.delete('profile');
    await store.save();
}

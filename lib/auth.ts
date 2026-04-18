/**
 * SERVE Auth Service — Client-side GitHub Device Flow via API routes
 * Replaces Tauri plugin-store + plugin-http with localStorage + fetch
 */

'use client';

const STORAGE_KEY = 'serve_auth';

interface AuthProfile {
    token: string;
    status: 'pending' | 'active' | 'expired';
    deviceCode?: string;
    userCode?: string;
    verificationUri?: string;
    updatedAt: number;
}

function getProfile(): AuthProfile | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveProfile(profile: AuthProfile) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, updatedAt: Date.now() }));
}

// Check if currently authenticated
export async function isAuthenticated(): Promise<boolean> {
    const profile = getProfile();
    return !!profile && profile.status === 'active' && !!profile.token;
}

// Start GitHub Device Flow
export async function startDeviceFlow(): Promise<{
    userCode: string;
    verificationUri: string;
    deviceCode: string;
}> {
    const response = await fetch('/api/auth/device', {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Device code request failed: ${response.statusText}`);
    }

    const data = await response.json();

    saveProfile({
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
    const profile = getProfile();

    if (!profile) {
        return { status: 'error', error: 'No pending login found' };
    }

    if (profile.status === 'active' && profile.token) {
        return { status: 'success', access_token: profile.token };
    }

    if (!profile.deviceCode) {
        return { status: 'error', error: 'No pending device code found' };
    }

    const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_code: profile.deviceCode }),
    });

    const data = await response.json();

    if (data.access_token) {
        saveProfile({
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

// Get auth headers for Copilot API calls (via server proxy)
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const profile = getProfile();
    if (!profile || !profile.token || profile.status !== 'active') {
        throw new Error('AUTH_REQUIRED');
    }

    const response = await fetch('/api/auth/copilot-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_token: profile.token }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            saveProfile({ ...profile, status: 'expired', updatedAt: Date.now() });
        }
        throw new Error(`Failed to get runtime token: ${response.statusText}`);
    }

    const runtime = await response.json();
    return {
        Authorization: `Bearer ${runtime.token}`,
        'Editor-Version': 'vscode/1.85.0',
        'Editor-Plugin-Version': 'copilot/1.155.0',
        'User-Agent': 'GithubCopilot/1.155.0',
    };
}

// Fetch available models from Copilot API
export async function fetchModels(): Promise<{ id: string; name: string }[]> {
    try {
        const profile = getProfile();
        if (!profile || !profile.token) return getDefaultModels();

        const response = await fetch('/api/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ github_token: profile.token }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.models && Array.isArray(data.models) && data.models.length > 0) {
                const uniqueModels = Array.from(new Map(data.models.map((m: any) => [m.id, m])).values());
                return uniqueModels as { id: string; name: string }[];
            }
        }

        return getDefaultModels();
    } catch (e) {
        console.error('Failed to fetch models:', e);
        return getDefaultModels();
    }
}

function getDefaultModels() {
    return [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'o1-preview', name: 'o1-preview' },
        { id: 'o1-mini', name: 'o1-mini' },
    ];
}

// Sign out
export async function signOut() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

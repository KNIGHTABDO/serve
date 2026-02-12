
import { updateProfile, getProfile } from './store';

const CLIENT_ID = 'Iv1.b507a08c87ecfe98'; // Standard GitHub Copilot Client ID
const USER_AGENT = 'GithubCopilot/1.155.0';

// 1. Start Device Flow
export async function startDeviceFlow() {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: 'read:user' // Minimal scope for Copilot
    })
  });

  if (!response.ok) {
    throw new Error(`Device code request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Save to store
  updateProfile('github-copilot-main', {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresIn: data.expires_in,
    interval: data.interval,
    status: "pending",
    token: "" // No token yet
  });

  return {
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    deviceCode: data.device_code
  };
}

// 2. Poll for Access Token
export async function pollForToken(deviceCode: string, intervalSeconds: number = 5) {
  let attempts = 0;
  const maxAttempts = 100; // Safety break

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    
    const result = await checkTokenStatus(deviceCode);
    
    if (result.status === 'success') {
      return result.access_token;
    } else if (result.status === 'expired') {
      throw new Error('Token expired. Please restart login.');
    } else if (result.status === 'error') {
      throw new Error(`Polling error: ${result.error}`);
    } else if (result.status === 'slow_down') {
      intervalSeconds += 5;
    }
    // pending -> continue
    attempts++;
  }
  throw new Error('Polling timed out');
}

// 2b. Check Token Status (Single Shot for API)
export async function checkTokenStatus(deviceCode: string) {
  console.log("Checking token status for device code:", deviceCode.substring(0, 5) + "...");
  
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    }),
    cache: 'no-store' // Critical: Prevent Next.js from caching the pending response
  });

  const data = await response.json();
  console.log("GitHub Token Response:", JSON.stringify(data));

  if (data.access_token) {
    updateProfile('github-copilot-main', {
      token: data.access_token,
      status: "active",
      deviceCode: undefined,
      userCode: undefined,
      verificationUri: undefined
    });
    return { status: "success", access_token: data.access_token };
  }

  if (data.error === 'authorization_pending') {
    return { status: "pending" };
  } else if (data.error === 'slow_down') {
    return { status: "slow_down", interval_increment: 5 };
  } else if (data.error === 'expired_token') {
    return { status: "expired" };
  } else {
    return { status: "error", error: data.error_description || data.error };
  }
}

// 3. Exchange for Runtime Token (The "Real" Token)
export async function getRuntimeToken(ghToken: string) {
  const response = await fetch('https://api.github.com/copilot_internal/v2/token', {
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'User-Agent': USER_AGENT
    }
  });

  if (!response.ok) {
    // If 401, the GH token might be invalid
    if (response.status === 401) {
       updateProfile('github-copilot-main', { status: 'expired' });
    }
    throw new Error(`Failed to get runtime token: ${response.statusText}`);
  }

  const data = await response.json();
  // data.token is the actual token we send to the model API
  // data.expires_at is when it expires
  return data;
}

// 4. Fetch Available Models (The "Proper" Way)
export async function fetchCopilotModels(ghToken: string) {
  // Try the dedicated models endpoint first (if available/known)
  // Otherwise, fallback to hardcoded list known to work with Copilot Business/Individual
  
  // Note: Copilot API doesn't always expose a public "list models" endpoint for all users,
  // but we can try to infer from capabilities or use the standard set.
  // However, `GET /copilot_internal/v2/token` response often contains configuration.
  
  try {
    // There isn't a universally documented "list models" endpoint for the internal API that works for all.
    // However, recent implementations use `https://api.github.com/copilot_internal/v2/models` or check `capabilities` in the token.
    // For now, we will return the standard supported list, and if possible, verify access.
    
    // Check if token works first
    await getRuntimeToken(ghToken);

    return [
      { id: 'gpt-4o', name: 'GPT-4o (Copilot)', provider: 'github-copilot' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Copilot)', provider: 'github-copilot' },
      { id: 'gpt-4', name: 'GPT-4 (Copilot)', provider: 'github-copilot' },
      { id: 'o1-preview', name: 'o1 Preview (Copilot)', provider: 'github-copilot' }
    ];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

// Helper to get headers for a request
export async function getAuthHeaders() {
  const profile = getProfile('github-copilot-main');
  if (!profile || !profile.token || profile.status !== 'active') {
    throw new Error("AUTH_REQUIRED");
  }

  const runtime = await getRuntimeToken(profile.token);
  return {
    'Authorization': `Bearer ${runtime.token}`,
    'Editor-Version': 'vscode/1.85.0',
    'Editor-Plugin-Version': 'copilot/1.155.0',
    'User-Agent': 'GithubCopilot/1.155.0'
  };
}

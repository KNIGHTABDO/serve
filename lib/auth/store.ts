
import fs from 'fs';
import path from 'path';
import os from 'os';

// Types
export type AuthProfile = {
  type: "token";
  provider: "github-copilot";
  token: string; // The GitHub OAuth Access Token
  userCode?: string; // For pending login
  verificationUri?: string; // For pending login
  expiresIn?: number;
  interval?: number;
  updatedAt: number;
  status: "pending" | "active" | "expired";
  deviceCode?: string;
};

export type AuthStore = {
  profiles: Record<string, AuthProfile>;
  activeProfileId?: string;
};

// Paths
const HOME_DIR = os.homedir();
const AUTH_DIR = path.join(HOME_DIR, '.openclaw', 'auth');
const AUTH_FILE = path.join(AUTH_DIR, 'profiles.json');

// Ensure directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// Load Store
export function loadStore(): AuthStore {
  try {
    if (!fs.existsSync(AUTH_FILE)) {
      return { profiles: {} };
    }
    const data = fs.readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load auth store:", error);
    return { profiles: {} };
  }
}

// Save Store (Atomic)
export function saveStore(store: AuthStore) {
  const tempFile = `${AUTH_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), { mode: 0o600 });
  fs.renameSync(tempFile, AUTH_FILE);
}

// Helper to update a profile
export function updateProfile(id: string, updates: Partial<AuthProfile>) {
  const store = loadStore();
  const existing = store.profiles[id] || { 
    type: "token", 
    provider: "github-copilot", 
    updatedAt: Date.now(),
    status: "pending",
    token: ""
  };
  
  store.profiles[id] = { ...existing, ...updates, updatedAt: Date.now() };
  saveStore(store);
  return store.profiles[id];
}

export function getProfile(id: string): AuthProfile | undefined {
  const store = loadStore();
  return store.profiles[id];
}

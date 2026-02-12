
import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/lib/auth';

export async function POST() {
  const store = loadStore();
  delete store.profiles['github-copilot-main'];
  delete store.activeProfileId;
  saveStore(store);
  return NextResponse.json({ success: true });
}

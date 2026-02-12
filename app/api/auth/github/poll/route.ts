
import { NextResponse } from 'next/server';
import { checkTokenStatus, getProfile } from '@/lib/auth';

export async function POST() {
  const profile = getProfile('github-copilot-main');
  
  if (!profile) {
    return NextResponse.json({ error: "No pending login found" }, { status: 400 });
  }

  // If already active, return success immediately
  if (profile.status === 'active') {
    return NextResponse.json({ status: 'success', access_token: profile.token });
  }

  if (!profile.deviceCode) {
    return NextResponse.json({ error: "No pending device code found" }, { status: 400 });
  }

  try {
    const result = await checkTokenStatus(profile.deviceCode);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

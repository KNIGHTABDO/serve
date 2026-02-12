
import { NextResponse } from 'next/server';
import { startDeviceFlow, getProfile } from '@/lib/auth';

// Start Login Flow
export async function POST() {
  try {
    const data = await startDeviceFlow();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

// Check Auth Status
export async function GET() {
  const profile = getProfile('github-copilot-main');
  
  if (profile && profile.status === 'active' && profile.token) {
     return NextResponse.json({ 
       authenticated: true,
       user: 'GitHub User',
       updatedAt: profile.updatedAt
     });
  }
  return NextResponse.json({ authenticated: false });
}

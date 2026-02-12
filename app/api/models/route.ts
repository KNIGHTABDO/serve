
import { NextResponse } from 'next/server';
import { fetchCopilotModels, getProfile } from '@/lib/auth';

export async function GET() {
  const profile = getProfile('github-copilot-main');
  
  if (!profile || !profile.token || profile.status !== 'active') {
    return NextResponse.json({ error: "Unauthorized. Please login with GitHub Copilot." }, { status: 401 });
  }

  try {
    const models = await fetchCopilotModels(profile.token);
    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

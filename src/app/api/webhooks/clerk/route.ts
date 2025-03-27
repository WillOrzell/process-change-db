import { NextRequest, NextResponse } from 'next/server';

// This is a simplified webhook handler that just returns success
// In a real app with Clerk, this would handle user creation/updates
export async function POST(req: NextRequest) {
  return NextResponse.json({ success: true });
} 
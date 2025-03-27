import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware to replace Clerk's authMiddleware
export function middleware(request: NextRequest) {
  // For now, we're allowing all requests through
  // In a real app, you would check for authentication here
  return NextResponse.next();
}

export const config = {
  // Match all paths except for static files, api/webhooks, _next/static, _next/image, favicon.ico
  matcher: [
    '/((?!_next/image|_next/static|favicon.ico|public/|api/webhooks).*)',
  ],
}; 
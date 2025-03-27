import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/'],
  
  // Routes that can be accessed while signed in or not
  ignoredRoutes: ['/api/webhooks/clerk'],
});

export const config = {
  // Match all paths except for static files, api/webhooks, _next/static, _next/image, favicon.ico
  matcher: [
    '/((?!_next/image|_next/static|favicon.ico|public/|api/webhooks).*)',
  ],
}; 
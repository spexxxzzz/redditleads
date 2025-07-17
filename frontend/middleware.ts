// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/onboarding(.*)',
    '/connect-reddit(.*)',
]);

const isOnboardingRoute = createRouteMatcher([
    '/onboarding(.*)',
    '/connect-reddit(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();

  // 1. If the user is not logged in and tries to access a protected route, redirect them to sign-in.
  if (!userId && isProtectedRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  // 2. If the user IS logged in:
  if (userId) {
    // Check for the custom claim from Clerk's session.
    const hasConnectedReddit = (sessionClaims?.publicMetadata as any)?.hasConnectedReddit === true;

    // A. If they try to access the dashboard but haven't connected Reddit, force them to the connect page.
    if (req.nextUrl.pathname.startsWith('/dashboard') && !hasConnectedReddit) {
      const connectRedditUrl = new URL('/connect-reddit', req.url);
      return NextResponse.redirect(connectRedditUrl);
    }

    // B. If they HAVE connected Reddit but try to go back to the onboarding/connect pages, send them to the dashboard.
    if (isOnboardingRoute(req) && hasConnectedReddit) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  // Allow all other requests to proceed.
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define the routes that are "public" and do not require authentication.
// All other routes will be protected by default.
const isPublicRoute = createRouteMatcher([
    '/',
    '/pricing',
    '/blog(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/clerk-webhooks', // Ensure the webhook is public
]);

// This is the main middleware function.
export default clerkMiddleware();

export const config = {
  // This specifies which routes the middleware will run on.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
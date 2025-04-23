import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
const isProtectedRoute = createRouteMatcher([
  '/dashboard/(admin|doctor|patient)(.*)',
]);
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url).toString());
    }
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user || user.role === 'unlisted') {
      return NextResponse.redirect(
        new URL("/complete-profile", req.url).toString()
      );
    }
    switch (user.role) {
      case 'admin':
        if (!req.url.endsWith('/admin')) {
          return NextResponse.redirect(new URL('/dashboard/admin', req.url).toString());
        }
        break;
      case 'doctor':
        if (!req.url.includes('/doctor')) {
          return NextResponse.redirect(new URL('/dashboard/doctor', req.url).toString());
        }
        break;
      case 'patient':
        if (!req.url.includes('/patient')) {
          return NextResponse.redirect(new URL('/dashboard/patient', req.url).toString());
        }
        break;
      default:
        return NextResponse.redirect(
          new URL("/complete-profile", req.url).toString()
        );
      // break;
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
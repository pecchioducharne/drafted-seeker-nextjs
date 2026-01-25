import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/video-recorder1',
  '/video-recorder2',
  '/video-recorder3',
  '/recruiter',
  '/events',
  '/profile-lookup',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // For now, we'll handle auth client-side since Firebase auth is client-side
  // This middleware is a placeholder for future server-side auth if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

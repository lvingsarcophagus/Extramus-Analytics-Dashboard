import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Map of original API endpoints to fallback endpoints
const API_FALLBACKS = {
  '/api/interns': '/api/interns-fallback',
  '/api/housing': '/api/housing-fallback',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is one of our API routes that needs to be redirected
  if (API_FALLBACKS[pathname as keyof typeof API_FALLBACKS]) {
    const fallbackUrl = new URL(API_FALLBACKS[pathname as keyof typeof API_FALLBACKS], request.url);
    
    // Log the redirection (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Middleware: Redirecting ${pathname} to fallback ${fallbackUrl.pathname}`);
    }
    
    return NextResponse.rewrite(fallbackUrl);
  }

  // For all other routes, continue normal request handling
  return NextResponse.next();
}

// Only run middleware on API routes that we need to handle
export const config = {
  matcher: [
    '/api/interns',
    '/api/housing',
  ],
};

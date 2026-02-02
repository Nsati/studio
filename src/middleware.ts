import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Global Middleware for CORS and Security.
 * Handles cross-origin requests for API routes and manages preflight OPTIONS.
 */

export function middleware(request: NextRequest) {
  // Apply CORS only to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    // In production, you might want to use an environment variable for allowed origins
    const allowedOrigin = 'http://localhost:3000';

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();

    // Set standard CORS headers for other methods
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    return response;
  }

  return NextResponse.next();
}

// Ensure middleware only runs on API routes to save performance
export const config = {
  matcher: '/api/:path*',
};

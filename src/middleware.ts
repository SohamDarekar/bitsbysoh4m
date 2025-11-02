// Full code for src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env.local");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect both the admin page and its API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // Allow the login API route to be public
    if (pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }
      // For the /admin page, let the client-side handle the redirect to show the login form
      return NextResponse.next();
    }

    try {
      await jwtVerify(token, getSecretKey());
      return NextResponse.next();
    } catch (err) {
      // Invalid token
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
      }
      // Redirect to /admin page, client-side will see no token and show login
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = ''; // Clear any search params
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/api/admin/:path*'],
};

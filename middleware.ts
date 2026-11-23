import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const GHOST_BASE_URL = process.env.GHOST_URL?.replace(/\/+$/, '');

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (GHOST_BASE_URL && pathname.startsWith('/r/')) {
    const redirectUrl = new URL(`${GHOST_BASE_URL}${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/r/:path*'],
};

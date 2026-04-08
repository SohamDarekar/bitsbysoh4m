import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const GHOST_BASE_URL = 'https://ghost.sohamdarekar.dev';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith('/r/')) {
    const redirectUrl = new URL(`${pathname}${search}`, GHOST_BASE_URL);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/r/:path*'],
};

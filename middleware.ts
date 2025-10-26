import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/complete-registration')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const registrationComplete = (token as any).registrationComplete;

    if (!registrationComplete && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/complete-registration', req.url));
    }

    if (registrationComplete && pathname.startsWith('/complete-registration')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/complete-registration/:path*'],
};

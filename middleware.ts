import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // /login y /register redirigen si ya hay sesión — pero '/' es siempre accesible
  const authOnlyRedirectPaths = ['/login', '/register'];
  const isAuthRedirectPath = authOnlyRedirectPaths.includes(pathname);

  if (token && isAuthRedirectPath) {
    const registrationComplete = (token as any).registrationComplete;
    if (!registrationComplete) {
      return NextResponse.redirect(new URL('/complete-registration', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/complete-registration'))) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (token) {
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
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/complete-registration/:path*'],
};

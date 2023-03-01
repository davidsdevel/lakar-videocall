import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/([^/.]*)',
    '/',
    '/login',
    '/signin',
    '/_dashboard'
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;  

  const isAuth = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

  if (isAuth) {
    if (url.pathname === '/login' || url.pathname === '/signin') {
      url.pathname = '/';

      return NextResponse.redirect(url);
    } else if (url.pathname === '/') {
      url.pathname = '/_dashboard';

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

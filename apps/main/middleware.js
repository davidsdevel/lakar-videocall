import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/([^/.]*)',
    '/',
    '/login',
    '/signin',
    '/_dashboard',
    '/messages/:path+',
    '/contacts/:path+'
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;  

  const isAuth = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

  if (isAuth) {
    if (url.pathname === '/login' || url.pathname === '/signin') {
      url.pathname = '/';

      return NextResponse.redirect(url);
    } else {
      url.pathname = `/_dashboard${url.pathname}`;

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

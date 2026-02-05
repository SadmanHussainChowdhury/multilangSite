import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default async function middleware(request: NextRequest) {
  // Handle locale routing first
  const response = intlMiddleware(request);
  
  // Protect dashboard and admin routes
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.includes('/dashboard');
  const isAdminRoute = pathname.includes('/admin');
  
  if (isDashboardRoute || isAdminRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      // Extract locale from pathname
      const locale = locales.find(loc => pathname.startsWith(`/${loc}/`)) || defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return Response.redirect(loginUrl);
    }

    if (isAdminRoute && token.role !== 'admin') {
      const locale = locales.find(loc => pathname.startsWith(`/${loc}/`)) || defaultLocale;
      const homeUrl = new URL(`/${locale}`, request.url);
      return Response.redirect(homeUrl);
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

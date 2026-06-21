import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from './lib/authEnv';
import { locales, defaultLocale, type Locale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

function getPathLocale(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return locales.includes(firstSegment as Locale) ? (firstSegment as Locale) : defaultLocale;
}

function hasLocaleSegment(pathname: string, segment: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return locales.includes(segments[0] as Locale) && segments[1] === segment;
}

export default async function middleware(request: NextRequest) {
  // Handle locale routing first
  const response = intlMiddleware(request);
  
  // Protect dashboard and admin routes
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = hasLocaleSegment(pathname, 'dashboard');
  const isAdminRoute = hasLocaleSegment(pathname, 'admin');
  
  if (isDashboardRoute || isAdminRoute) {
    const token = await getToken({ 
      req: request,
      secret: getAuthSecret()
    });
    
    if (!token) {
      const locale = getPathLocale(pathname);
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return Response.redirect(loginUrl);
    }

    if (isAdminRoute && token.role !== 'admin') {
      const locale = getPathLocale(pathname);
      const homeUrl = new URL(`/${locale}`, request.url);
      return Response.redirect(homeUrl);
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

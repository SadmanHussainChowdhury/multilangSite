import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define all existing hardcoded routes/slugs in the application
const EXISTING_ROUTES = [
  { slug: 'home', name: 'Home Page', route: '/' },
  { slug: 'about', name: 'About Us', route: '/about' },
  { slug: 'ceo-message', name: 'CEO Message', route: '/ceo-message' },
  { slug: 'contact', name: 'Contact Us', route: '/contact' },
  { slug: 'incometaxrefund', name: 'Income Tax Refund', route: '/incometaxrefund' },
  { slug: 'houserenttaxrefund', name: 'House Rent Tax Refund', route: '/houserenttaxrefund' },
  { slug: 'familytaxrefund', name: 'Family Tax Refund', route: '/familytaxrefund' },
  { slug: 'visa-changes', name: 'Visa Changes', route: '/visa-changes' },
  { slug: 'job-support', name: 'Job Support', route: '/job-support' },
  { slug: 'supported-countries', name: 'Supported Countries', route: '/supported-countries' },
  { slug: 'welcome', name: 'Welcome', route: '/welcome' },
];

// GET - Check which routes have pages in database (across ALL locales)
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    // locale param is now optional; if provided, filter; if 'all' or absent, show all
    const localeFilter = searchParams.get('locale') || 'all';

    await connectDB();

    // Get ALL pages (no locale filter, so we see everything including custom pages in any locale)
    const query: any = { deletedAt: null };
    if (localeFilter && localeFilter !== 'all') {
      query.locale = localeFilter;
    }
    const existingPages = await Page.find(query).lean();

    // Group pages by slug for easier lookup
    const pagesBySlug = new Map<string, any[]>();
    existingPages.forEach((page: any) => {
      const arr = pagesBySlug.get(page.slug) || [];
      arr.push(page);
      pagesBySlug.set(page.slug, arr);
    });

    // Check each hardcoded route
    const existingRouteSlugs = new Set(EXISTING_ROUTES.map(r => r.slug));
    const routeStatus: any[] = EXISTING_ROUTES.map(route => {
      const pagesForSlug = pagesBySlug.get(route.slug) || [];
      const hasPage = pagesForSlug.length > 0;
      // Use the first active page, or just the first page
      const activePage = pagesForSlug.find((p: any) => p.isActive) || pagesForSlug[0];

      return {
        ...route,
        hasPage,
        pageId: activePage?._id?.toString(),
        isActive: activePage?.isActive || false,
        locale: activePage?.locale || null,
        locales: pagesForSlug.map((p: any) => ({ locale: p.locale, isActive: p.isActive, pageId: p._id.toString() })),
        lastUpdated: activePage?.updatedAt || null,
        isCustom: false,
      };
    });

    // Add any custom pages that are not in EXISTING_ROUTES
    const seenCustomSlugs = new Set<string>();
    existingPages.forEach((page: any) => {
      if (!existingRouteSlugs.has(page.slug)) {
        const key = page.slug;
        if (!seenCustomSlugs.has(key)) {
          seenCustomSlugs.add(key);
          const allForSlug = pagesBySlug.get(page.slug) || [];
          const activePage = allForSlug.find((p: any) => p.isActive) || allForSlug[0];
          routeStatus.push({
            slug: page.slug,
            name: page.title,
            route: `/${page.slug}`,
            hasPage: true,
            pageId: activePage?._id?.toString(),
            isActive: activePage?.isActive || false,
            locale: activePage?.locale || null,
            locales: allForSlug.map((p: any) => ({ locale: p.locale, isActive: p.isActive, pageId: p._id.toString() })),
            lastUpdated: activePage?.updatedAt || null,
            isCustom: true,
          });
        }
      }
    });

    return NextResponse.json({
      data: routeStatus,
      total: routeStatus.length,
      withPages: routeStatus.filter(r => r.hasPage).length,
      withoutPages: routeStatus.filter(r => !r.hasPage).length,
    });
  } catch (error) {
    console.error('Check routes error:', error);
    return NextResponse.json(
      { message: 'Failed to check routes', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

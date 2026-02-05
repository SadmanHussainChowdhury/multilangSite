import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define all existing routes/slugs in the application
const EXISTING_ROUTES = [
  { slug: 'home', name: 'Home Page', route: '/' },
  { slug: 'about', name: 'About Us', route: '/about' },
  { slug: 'ceo-message', name: 'CEO Message', route: '/ceo-message' },
  { slug: 'incometaxrefund', name: 'Income Tax Refund', route: '/incometaxrefund' },
  { slug: 'houserenttaxrefund', name: 'House Rent Tax Refund', route: '/houserenttaxrefund' },
  { slug: 'familytaxrefund', name: 'Family Tax Refund', route: '/familytaxrefund' },
  { slug: 'visa-changes', name: 'Visa Changes', route: '/visa-changes' },
  { slug: 'job-support', name: 'Job Support', route: '/job-support' },
  { slug: 'supported-countries', name: 'Supported Countries', route: '/supported-countries' },
];

// GET - Check which routes have pages in database
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    await connectDB();

    // Get all pages for this locale
    const existingPages = await Page.find({
      locale,
      deletedAt: null,
    });

    // Create a map of existing slugs
    const existingSlugs = new Set(existingPages.map(p => p.slug));

    // Check each route
    const routeStatus = EXISTING_ROUTES.map(route => {
      const hasPage = existingSlugs.has(route.slug);
      const page = existingPages.find(p => p.slug === route.slug);
      
      return {
        ...route,
        hasPage,
        pageId: page?._id.toString(),
        isActive: page?.isActive || false,
        lastUpdated: page?.updatedAt || null,
      };
    });

    return NextResponse.json({
      data: routeStatus,
      total: EXISTING_ROUTES.length,
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

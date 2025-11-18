import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch a page by slug and locale (public API)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    await connectDB();

    const page = await Page.findOne({
      slug,
      locale,
      isActive: true,
      deletedAt: null,
    });

    if (!page) {
      // Return 404 but don't throw error - let client handle fallback
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error('Fetch page error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


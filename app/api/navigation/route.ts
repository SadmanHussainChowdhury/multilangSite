import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';

const NAVIGATION_SLUGS = [
  'about',
  'ceo-message',
  'contact',
  'incometaxrefund',
  'houserenttaxrefund',
  'familytaxrefund',
  'visa-changes',
  'job-support',
  'supported-countries',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!locales.includes(locale as any)) {
      return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
    }

    await connectDB();

    const pages = await Page.find({
      locale,
      slug: { $in: NAVIGATION_SLUGS },
      deletedAt: null,
    }).select('slug isActive');

    const pageMap = new Map(pages.map((page) => [page.slug, page.isActive]));
    const visibility = NAVIGATION_SLUGS.reduce<Record<string, boolean>>((acc, slug) => {
      acc[slug] = pageMap.has(slug) ? Boolean(pageMap.get(slug)) : true;
      return acc;
    }, {});

    return NextResponse.json({ data: visibility });
  } catch (error) {
    console.error('Fetch navigation visibility error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch navigation visibility' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';

const NAVIGATION_SLUGS = [
  'home',
  'about',
  'ceo-message',
  'contact',
  'incometaxrefund',
  'houserenttaxrefund',
  'familytaxrefund',
  'visa-changes',
  'job-support',
  'supported-countries',
  'welcome',
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
      deletedAt: null,
    }).select('slug title isActive');

    const visibility = NAVIGATION_SLUGS.reduce<Record<string, boolean>>((acc, slug) => {
      const page = pages.find(p => p.slug === slug);
      acc[slug] = page ? Boolean(page.isActive) : true;
      return acc;
    }, {});

    const customPages = pages.filter(
      page => !NAVIGATION_SLUGS.includes(page.slug) && page.isActive
    ).map(page => ({
      slug: page.slug,
      title: page.title
    }));

    return NextResponse.json({ data: visibility, customPages });
  } catch (error) {
    console.error('Fetch navigation visibility error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch navigation visibility' },
      { status: 500 }
    );
  }
}

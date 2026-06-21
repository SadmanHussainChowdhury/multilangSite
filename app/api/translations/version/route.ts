import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TranslationVersion from '@/models/TranslationVersion';
import { locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!locales.includes(locale as any)) {
      return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
    }

    await connectDB();

    const version = await TranslationVersion.findOne({ locale }).lean();

    return NextResponse.json({
      locale,
      version: version?.version || 0,
      updatedAt: version?.updatedAt || null,
    });
  } catch (error) {
    console.error('Fetch translation version error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch translation version' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Footer from '@/models/Footer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Public API to fetch footer by locale
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    await connectDB();

    const footer = await Footer.findOne({ locale, isActive: true });

    if (!footer) {
      return NextResponse.json({ message: 'Footer not found' }, { status: 404 });
    }

    return NextResponse.json({ data: footer });
  } catch (error) {
    console.error('Fetch footer error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch footer' },
      { status: 500 }
    );
  }
}


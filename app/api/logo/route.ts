import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Logo from '@/models/Logo';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch active logo (public API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    await connectDB();

    // Try to find locale-specific logo first
    let logo = await Logo.findOne({
      locale,
      isActive: true,
    });

    // If no locale-specific logo, use default (en or any active logo)
    if (!logo) {
      logo = await Logo.findOne({
        isActive: true,
      }).sort({ createdAt: -1 });
    }

    if (!logo) {
      return NextResponse.json(
        { message: 'No logo found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: logo });
  } catch (error) {
    console.error('Fetch logo error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const visaType = searchParams.get('visa_type');

    // Build query
    const query: any = {};
    if (visaType && visaType !== 'all') {
      query.visa_type = visaType;
    }

    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments(query),
    ]);

    return NextResponse.json({
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin fetch registrations error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

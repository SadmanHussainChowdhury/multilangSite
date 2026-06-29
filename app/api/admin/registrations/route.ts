import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  alien_number: z.string().min(1, 'Alien number is required').trim(),
  passport_number: z.string().trim().optional(),
  nationality: z.string().min(1, 'Nationality is required').trim(),
  phone: z.string().min(1, 'Phone is required').trim(),
  visa_type: z.enum(['income_tax', 'house_rent', 'family_tax', 'other']),
  message: z.string().trim().optional(),
  country: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10) || 1));
    const skip = (page - 1) * limit;
    const visaType = searchParams.get('visa_type');

    if (visaType && visaType !== 'all' && !['income_tax', 'house_rent', 'family_tax', 'other'].includes(visaType)) {
      return NextResponse.json({ message: 'Invalid service type' }, { status: 400 });
    }

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

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const validatedData = registrationSchema.parse(body);

    await connectDB();

    const registration = await Registration.create(validatedData);

    return NextResponse.json(
      { message: 'Registration created successfully', data: registration },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    console.error('Create registration error:', error);
    return NextResponse.json(
      { message: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

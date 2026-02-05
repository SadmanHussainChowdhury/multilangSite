import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).trim(),
  alien_number: z.string().min(1, 'Alien registration number is required').max(255).trim(),
  passport_number: z.string().max(255).trim().optional(),
  nationality: z.string().min(1, 'Nationality is required').max(255).trim(),
  phone: z.string().min(1, 'Phone number is required').max(20).trim(),
  visa_type: z.enum(['income_tax', 'house_rent', 'family_tax', 'other']),
  message: z.string().max(1000).trim().optional(),
  country: z.string().max(255).trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Clean up empty optional fields - convert empty strings to undefined
    const cleanedBody: any = {
      name: body.name?.trim(),
      alien_number: body.alien_number?.trim(),
      nationality: body.nationality?.trim(),
      phone: body.phone?.trim(),
      visa_type: body.visa_type,
      passport_number: body.passport_number?.trim() || undefined,
      message: body.message?.trim() || undefined,
      country: body.country?.trim() || undefined,
    };
    
    // Validate input
    const validatedData = registrationSchema.parse(cleanedBody);

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          message: 'Database connection failed. Please check your MongoDB connection.',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

    // Create registration
    try {
      const registration = await Registration.create(validatedData);

      return NextResponse.json(
        { message: 'Registration saved successfully', data: registration },
        { status: 201 }
      );
    } catch (createError: any) {
      console.error('Registration creation error:', createError);
      return NextResponse.json(
        { 
          message: 'Failed to save registration',
          error: createError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to save registration. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const registrations = await Registration.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Registration.countDocuments();

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
    console.error('Fetch registrations error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

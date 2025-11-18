import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Logo from '@/models/Logo';
import { z } from 'zod';

const logoSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  imageUrl: z.string().url('Valid image URL is required').trim(),
  altText: z.string().trim().optional(),
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my']).optional(),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch all logos
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const logos = await Logo.find().sort({ createdAt: -1 });

    return NextResponse.json({ data: logos });
  } catch (error) {
    console.error('Fetch logos error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
}

// POST - Create new logo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = logoSchema.parse(body);

    await connectDB();

    const logo = await Logo.create(validatedData);

    return NextResponse.json(
      { message: 'Logo created successfully', data: logo },
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

    console.error('Create logo error:', error);
    return NextResponse.json(
      { message: 'Failed to create logo' },
      { status: 500 }
    );
  }
}


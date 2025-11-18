import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Logo from '@/models/Logo';
import { z } from 'zod';

const logoUpdateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  imageUrl: z.string().url().trim().optional(),
  altText: z.string().trim().optional(),
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my']).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single logo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const logo = await Logo.findById(id);

    if (!logo) {
      return NextResponse.json({ message: 'Logo not found' }, { status: 404 });
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

// PUT - Update logo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const validatedData = logoUpdateSchema.parse(body);
    await connectDB();

    const logo = await Logo.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!logo) {
      return NextResponse.json({ message: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Logo updated successfully',
      data: logo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Update logo error:', error);
    return NextResponse.json(
      { message: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const logo = await Logo.findByIdAndDelete(id);

    if (!logo) {
      return NextResponse.json({ message: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Delete logo error:', error);
    return NextResponse.json(
      { message: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}


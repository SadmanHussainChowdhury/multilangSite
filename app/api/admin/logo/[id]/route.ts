import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Logo from '@/models/Logo';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^https?:\/\/|^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(value),
    'Valid image URL or base64 image data is required'
  );

const logoUpdateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  imageUrl: imageUrlSchema.optional(),
  altText: z.string().trim().optional(),
  locale: z.enum(['vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko']).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single logo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

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
    const authError = await requireAdmin(request);
    if (authError) return authError;

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
    const authError = await requireAdmin(request);
    if (authError) return authError;

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


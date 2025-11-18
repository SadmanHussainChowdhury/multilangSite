import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required').max(255).trim(),
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my']),
  metaTitle: z.string().max(255).trim().optional(),
  metaDescription: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional(),
});

// GET - Fetch a single page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const page = await Page.findOne({ _id: id, deletedAt: null });

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    console.error('Fetch page error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validatedData = pageSchema.parse(body);

    await connectDB();

    // Check if another page with same slug and locale exists
    const existingPage = await Page.findOne({
      _id: { $ne: id },
      slug: validatedData.slug,
      locale: validatedData.locale,
      deletedAt: null,
    });

    if (existingPage) {
      return NextResponse.json(
        { message: 'Page with this slug and locale already exists' },
        { status: 400 }
      );
    }

    const page = await Page.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Page updated successfully',
      data: page,
    });
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

    console.error('Update page error:', error);
    return NextResponse.json(
      { message: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const page = await Page.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { message: 'Failed to delete page' },
      { status: 500 }
    );
  }
}


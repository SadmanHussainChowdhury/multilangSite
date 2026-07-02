import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().max(255).trim().transform(normalizeSlug).pipe(
    z.string().min(1, 'Slug is required')
  ),
  locale: z.enum(['vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko']),
  metaTitle: z.string().max(255).trim().optional(),
  metaDescription: z.string().max(500).trim().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET - Fetch a single page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

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
    const authError = await requireAdmin(request);
    if (authError) return authError;

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

    const page = await Page.findOneAndUpdate(
      { _id: id, deletedAt: null },
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
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = params;
    await connectDB();

    const page = await Page.findOne({ _id: id, deletedAt: null });

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    page.deletedAt = new Date();
    page.slug = `${page.slug}--deleted-${page._id.toString()}`;
    await page.save();

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { message: 'Failed to delete page' },
      { status: 500 }
    );
  }
}


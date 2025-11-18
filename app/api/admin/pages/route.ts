import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required').max(255).trim(),
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my']),
  metaTitle: z.string().max(255).trim().optional(),
  metaDescription: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch all pages with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const locale = searchParams.get('locale');
    const slug = searchParams.get('slug');

    const query: any = { deletedAt: null };
    if (locale) query.locale = locale;
    if (slug) query.slug = slug;

    const pages = await Page.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Page.countDocuments(query);

    return NextResponse.json({
      data: pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch pages error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = pageSchema.parse(body);

    await connectDB();

    // Check if page with same slug and locale already exists
    const existingPage = await Page.findOne({
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

    const page = await Page.create(validatedData);

    return NextResponse.json(
      { message: 'Page created successfully', data: page },
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

    console.error('Create page error:', error);
    return NextResponse.json(
      { message: 'Failed to create page' },
      { status: 500 }
    );
  }
}


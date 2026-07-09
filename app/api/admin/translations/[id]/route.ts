import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { bumpTranslationVersion } from '@/lib/translationVersions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const translationUpdateSchema = z.object({
  key: z.string().min(1).trim().optional(),
  locale: z.enum(['vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko']).optional(),
  value: z.string().min(1).optional(),
  namespace: z.string().trim().optional(),
});

// GET - Get single translation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const translation = await Translation.findById(id);

    if (!translation) {
      return NextResponse.json({ message: 'Translation not found' }, { status: 404 });
    }

    return NextResponse.json({ data: translation });
  } catch (error) {
    console.error('Fetch translation error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch translation' },
      { status: 500 }
    );
  }
}

// PUT - Update translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const validatedData = translationUpdateSchema.parse(body);
    await connectDB();

    const existingTranslation = await Translation.findById(id);

    if (!existingTranslation) {
      return NextResponse.json({ message: 'Translation not found' }, { status: 404 });
    }

    const updateQuery: any = { _id: { $ne: id } };
    if (validatedData.key || validatedData.locale) {
      updateQuery.key = validatedData.key || existingTranslation.key;
      updateQuery.locale = validatedData.locale || existingTranslation.locale;

      const duplicate = await Translation.findOne(updateQuery);
      if (duplicate) {
        return NextResponse.json(
          { message: 'Translation with this key and locale already exists' },
          { status: 400 }
        );
      }
    }

    const translation = await Translation.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!translation) {
      return NextResponse.json({ message: 'Translation not found' }, { status: 404 });
    }

    await bumpTranslationVersion(translation.locale);

    return NextResponse.json({
      message: 'Translation updated successfully',
      data: translation,
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

    console.error('Update translation error:', error);
    return NextResponse.json(
      { message: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete translation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const translation = await Translation.findByIdAndDelete(id);

    if (!translation) {
      return NextResponse.json({ message: 'Translation not found' }, { status: 404 });
    }

    await bumpTranslationVersion(translation.locale);

    return NextResponse.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Delete translation error:', error);
    return NextResponse.json(
      { message: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { locales } from '@/i18n/config';
import { bumpTranslationVersion } from '@/lib/translationVersions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const translationSchema = z.object({
  key: z.string().min(1, 'Key is required').trim(),
  locale: z.enum(['vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko']),
  value: z.string().min(1, 'Value is required'),
  namespace: z.string().trim().optional(),
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET - Fetch all translations with filters
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const namespace = searchParams.get('namespace');
    const search = searchParams.get('search');

    await connectDB();

    const query: any = {};
    if (locale) {
      if (!locales.includes(locale as any)) {
        return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
      }
      query.locale = locale;
    }
    if (namespace) query.namespace = namespace;
    if (search) {
      const escapedSearch = escapeRegExp(search);
      query.$or = [
        { key: { $regex: escapedSearch, $options: 'i' } },
        { value: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const translations = await Translation.find(query).sort({ locale: 1, key: 1 });

    return NextResponse.json({ data: translations });
  } catch (error) {
    console.error('Fetch translations error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// POST - Create or update translation
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();

    // Handle bulk updates
    if (Array.isArray(body)) {
      await connectDB();
      const results = [];

      for (const item of body) {
        const validatedData = translationSchema.parse(item);
        const translation = await Translation.findOneAndUpdate(
          { key: validatedData.key, locale: validatedData.locale },
          validatedData,
          { upsert: true, new: true }
        );
        results.push(translation);
      }

      const updatedLocales = Array.from(new Set(results.map((translation) => translation.locale)));
      await Promise.all(updatedLocales.map((updatedLocale) => bumpTranslationVersion(updatedLocale)));

      return NextResponse.json({
        message: 'Translations updated successfully',
        data: results,
      });
    }

    // Single translation
    const validatedData = translationSchema.parse(body);
    await connectDB();

    const translation = await Translation.findOneAndUpdate(
      { key: validatedData.key, locale: validatedData.locale },
      validatedData,
      { upsert: true, new: true }
    );

    await bumpTranslationVersion(validatedData.locale);

    return NextResponse.json(
      { message: 'Translation saved successfully', data: translation },
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

    console.error('Create translation error:', error);
    return NextResponse.json(
      { message: 'Failed to save translation' },
      { status: 500 }
    );
  }
}

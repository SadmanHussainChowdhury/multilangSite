import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { z } from 'zod';

const translationSchema = z.object({
  key: z.string().min(1, 'Key is required').trim(),
  locale: z.enum(['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh']),
  value: z.string().min(1, 'Value is required'),
  namespace: z.string().trim().optional(),
});

// GET - Fetch all translations with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const namespace = searchParams.get('namespace');
    const search = searchParams.get('search');

    await connectDB();

    const query: any = {};
    if (locale) query.locale = locale;
    if (namespace) query.namespace = namespace;
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } },
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


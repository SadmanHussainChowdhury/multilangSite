import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { locales } from '@/i18n/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch all translations for a locale
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!locales.includes(locale as any)) {
      return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
    }

    await connectDB();

    const translations = await Translation.find({ locale });

    // Convert to nested object structure like JSON files
    const messages: Record<string, any> = {};

    translations.forEach((translation) => {
      const fullKey = translation.namespace 
        ? `${translation.namespace}.${translation.key}`
        : translation.key;
        
      const keys = fullKey.split('.');
      let current = messages;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = translation.value;
    });

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('Fetch translations error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}


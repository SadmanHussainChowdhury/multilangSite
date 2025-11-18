import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { clearCache, setCachedTranslation } from '@/lib/translationCache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Force refresh and return fresh translations for a locale
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const forceRefresh = searchParams.get('force') === 'true';

    if (forceRefresh) {
      // Clear cache first
      clearCache(locale);
    }

    await connectDB();
    const translations = await Translation.find({ locale });

    // Convert to nested object structure like JSON files
    const messages: Record<string, any> = {};

    translations.forEach((translation) => {
      const keys = translation.key.split('.');
      let current = messages;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = translation.value;
    });

    // Update cache with fresh data
    setCachedTranslation(locale, messages);

    return NextResponse.json({ 
      data: messages,
      locale,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Refresh translations error:', error);
    return NextResponse.json(
      { message: 'Failed to refresh translations' },
      { status: 500 }
    );
  }
}


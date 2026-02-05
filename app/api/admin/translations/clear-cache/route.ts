import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '@/lib/translationCache';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Clear translation cache
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    let locale: string | undefined;
    try {
      const body = await request.json();
      locale = body?.locale;
    } catch {
      // Empty body is fine
    }

    clearCache(locale);

    return NextResponse.json({
      message: locale ? `Cache cleared for ${locale}` : 'All cache cleared',
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { message: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '@/lib/translationCache';
import { requireAdmin } from '@/lib/admin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Force refresh translations (clear cache and return success)
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json().catch(() => ({}));
    const locale = body?.locale;

    // Clear cache
    clearCache(locale);

    return NextResponse.json({
      message: locale ? `Cache cleared for ${locale}` : 'All cache cleared',
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


import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { requireAdmin } from '@/lib/admin-auth';
import { clearCache } from '@/lib/translationCache';
import { bumpTranslationVersion } from '@/lib/translationVersions';
import { locales } from '@/i18n/config';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type FlatTranslation = {
  key: string;
  locale: string;
  value: string;
  namespace: string;
};

function flattenMessages(
  messages: Record<string, unknown>,
  locale: string,
  prefix = '',
  namespace = ''
): FlatTranslation[] {
  const result: FlatTranslation[] = [];

  Object.entries(messages).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(
        ...flattenMessages(
          value as Record<string, unknown>,
          locale,
          nextKey,
          namespace || key
        )
      );
      return;
    }

    result.push({
      key: nextKey,
      locale,
      value: String(value ?? ''),
      namespace: namespace || nextKey.split('.')[0],
    });
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const importedLocales: string[] = [];
    let importedCount = 0;

    for (const locale of locales) {
      const filePath = path.join(process.cwd(), 'i18n', 'messages', `${locale}.json`);
      const file = await readFile(filePath, 'utf8');
      const messages = JSON.parse(file) as Record<string, unknown>;
      const translations = flattenMessages(messages, locale);

      if (translations.length === 0) {
        continue;
      }

      await Translation.bulkWrite(
        translations.map((translation) => ({
          updateOne: {
            filter: {
              key: translation.key,
              locale: translation.locale,
            },
            update: {
              $set: translation,
            },
            upsert: true,
          },
        }))
      );

      clearCache(locale);
      await bumpTranslationVersion(locale);
      importedLocales.push(locale);
      importedCount += translations.length;
    }

    return NextResponse.json({
      message: 'Translations imported successfully',
      count: importedCount,
      locales: importedLocales,
    });
  } catch (error) {
    console.error('Import translations error:', error);
    return NextResponse.json(
      { message: 'Failed to import translations' },
      { status: 500 }
    );
  }
}

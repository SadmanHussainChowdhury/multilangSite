import path from 'path';
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { requireAdmin } from '@/lib/admin-auth';
import { clearCache } from '@/lib/translationCache';
import { bumpTranslationVersion } from '@/lib/translationVersions';
import { locales } from '@/i18n/config';

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

async function readLocaleFile(locale: string): Promise<Record<string, unknown> | null> {
  try {
    const { readFile } = await import('fs/promises');
    const filePath = path.join(process.cwd(), 'i18n', 'messages', `${locale}.json`);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Could not read messages file for locale: ${locale}`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const importedLocales: string[] = [];
    const skippedLocales: string[] = [];
    let importedCount = 0;

    for (const locale of locales) {
      const messages = await readLocaleFile(locale);

      if (!messages) {
        console.warn(`Could not read messages file for locale: ${locale}`);
        skippedLocales.push(locale);
        continue;
      }

      const translations = flattenMessages(messages, locale);

      if (translations.length === 0) {
        skippedLocales.push(locale);
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
      skipped: skippedLocales,
    });
  } catch (error) {
    console.error('Import translations error:', error);
    return NextResponse.json(
      { message: `Failed to import translations: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';
import connectDB from '@/lib/mongodb';
import Translation from '@/models/Translation';
import { getCachedTranslation, setCachedTranslation } from '@/lib/translationCache';

async function getTranslationsFromDB(locale: string): Promise<any> {
  try {
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

    return messages;
  } catch (error) {
    console.error('Error fetching translations from DB:', error);
    return null;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // Check cache first (but with shorter TTL for real-time updates)
  const cached = getCachedTranslation(locale);
  if (cached) {
    return {
      locale,
      messages: cached,
    };
  }

  // For admin pages or when cache is stale, always fetch fresh
  // This ensures real-time updates work properly

  // Try to get from database first
  let dbMessages = await getTranslationsFromDB(locale);

  // Try to load JSON file as fallback or for merging
  let jsonMessages: any = {};
  try {
    jsonMessages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    // If JSON file doesn't exist, try English as ultimate fallback
    if (locale !== defaultLocale) {
      try {
        jsonMessages = (await import(`./messages/${defaultLocale}.json`)).default;
      } catch (fallbackError) {
        console.warn(`Could not load translations for locale: ${locale}`);
      }
    }
  }

  // If no DB translations or empty, use JSON files
  if (!dbMessages || Object.keys(dbMessages).length === 0) {
    // Merge: DB translations override JSON, but JSON fills in missing keys
    dbMessages = { ...jsonMessages, ...dbMessages };
  } else {
    // Merge with JSON fallback for missing keys
    dbMessages = mergeDeep(jsonMessages, dbMessages);
  }

  // Update cache
  setCachedTranslation(locale, dbMessages);

  return {
    locale,
    messages: dbMessages,
  };
});

// Deep merge function
export function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}


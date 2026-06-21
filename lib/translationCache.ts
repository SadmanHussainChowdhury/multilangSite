// Translation cache management
const translationCache = new Map<string, { messages: any; timestamp: number }>();
const CACHE_TTL = 1000;

export function getCachedTranslation(locale: string): any | null {
  const cached = translationCache.get(locale);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.messages;
  }

  return null;
}

export function setCachedTranslation(locale: string, messages: any): void {
  translationCache.set(locale, {
    messages,
    timestamp: Date.now(),
  });
}

export function clearCache(locale?: string): void {
  if (locale) {
    translationCache.delete(locale);
  } else {
    translationCache.clear();
  }
}

export { translationCache };


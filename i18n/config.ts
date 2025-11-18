export const locales = [
  'en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh',
  'vi', 'th', 'km', 'id', 'ne', 'uz', 'fil', 'mn', 'ur', 'si', 'ta', 'my'
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'Arabic',
  bn: 'Bengali',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  vi: 'Vietnamese',
  th: 'Thai',
  km: 'Khmer',
  id: 'Indonesian',
  ne: 'Nepali',
  uz: 'Uzbek',
  fil: 'Filipino',
  mn: 'Mongolian',
  ur: 'Urdu',
  si: 'Sinhala',
  ta: 'Tamil',
  my: 'Burmese',
};


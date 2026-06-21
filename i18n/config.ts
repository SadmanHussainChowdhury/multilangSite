export const locales = [
  'vi', 'id', 'uz', 'mn', 'ne', 'my', 'si', 'bn', 'fil', 'km', 'th', 'en', 'ko'
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  vi: 'Vietnamese',
  id: 'Indonesian',
  uz: 'Uzbek',
  mn: 'Mongolian',
  ne: 'Nepali',
  my: 'Burmese',
  si: 'Sinhala',
  bn: 'Bengali',
  fil: 'Filipino',
  km: 'Khmer',
  th: 'Thai',
  en: 'English',
  ko: 'Korean',
};


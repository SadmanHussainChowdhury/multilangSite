import connectDB from '@/lib/mongodb';
import TranslationVersion from '@/models/TranslationVersion';
import { locales } from '@/i18n/config';

export async function bumpTranslationVersion(locale?: string) {
  const targetLocales = locale ? [locale] : [...locales];
  const now = new Date();

  await connectDB();

  await Promise.all(
    targetLocales.map((targetLocale) =>
      TranslationVersion.findOneAndUpdate(
        { locale: targetLocale },
        {
          $inc: { version: 1 },
          $set: { updatedAt: now },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
}

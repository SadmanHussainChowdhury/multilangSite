# Translation Guide

This guide explains how to add translations for all 11 supported languages.

## Supported Languages

1. **en** - English (default)
2. **ar** - Arabic (العربية)
3. **bn** - Bengali (বাংলা)
4. **es** - Spanish (Español)
5. **fr** - French (Français)
6. **de** - German (Deutsch)
7. **it** - Italian (Italiano)
8. **pt** - Portuguese (Português)
9. **ru** - Russian (Русский)
10. **ja** - Japanese (日本語)
11. **zh** - Chinese (中文)

## Translation Files Location

All translation files are located in: `i18n/messages/`

Each language has its own JSON file:
- `en.json` - English (complete)
- `ar.json` - Arabic (complete)
- `bn.json` - Bengali (complete)
- `es.json` - Spanish (needs translation)
- `fr.json` - French (needs translation)
- `de.json` - German (needs translation)
- `it.json` - Italian (needs translation)
- `pt.json` - Portuguese (needs translation)
- `ru.json` - Russian (needs translation)
- `ja.json` - Japanese (needs translation)
- `zh.json` - Chinese (needs translation)

## Translation Structure

Each translation file follows this structure:

```json
{
  "common": { ... },
  "nav": { ... },
  "home": { ... },
  "about": { ... },
  "ceoMessage": { ... },
  "contact": { ... },
  "services": { ... },
  "incomeTaxRefund": { ... },
  "houseRentTaxRefund": { ... },
  "familyTaxRefund": { ... },
  "visaChanges": { ... },
  "jobSupport": { ... },
  "supportedCountries": { ... }
}
```

## How to Add Translations

1. **Copy the English file** as a template:
   ```bash
   cp i18n/messages/en.json i18n/messages/es.json
   ```

2. **Translate all values** in the JSON file, keeping the keys the same.

3. **Test the translation** by switching languages in the app.

## Using Translations in Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  const tAbout = useTranslations('about');
  
  return (
    <div>
      <h1>{tAbout('title')}</h1>
      <p>{t('home')}</p>
    </div>
  );
}
```

## Language Switcher

The language switcher component automatically detects available languages and allows users to switch between them. It's included in the Navigation component.

## Adding New Translation Keys

When adding new content:

1. Add the key to `en.json` first
2. Translate to all other languages
3. Use the key in your component with `useTranslations()`

## Translation Services

For professional translations, consider:
- Google Translate API (for initial translations, then review)
- Professional translation services
- Native speakers for accuracy

## Notes

- Keep all keys consistent across all language files
- Use proper RTL (Right-to-Left) support for Arabic
- Test all pages after adding translations
- Ensure special characters are properly encoded


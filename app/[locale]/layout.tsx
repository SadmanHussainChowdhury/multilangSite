import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '../providers';
import LocaleHtml from '@/components/LocaleHtml';
import Footer from '@/components/Footer';
import TranslationRefresh from '@/components/TranslationRefresh';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <Providers>
      <NextIntlClientProvider messages={messages}>
        <TranslationRefresh />
        <LocaleHtml />
        {children}
        <Footer />
      </NextIntlClientProvider>
    </Providers>
  );
}


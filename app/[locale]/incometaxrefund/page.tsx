'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePageContent } from '@/hooks/usePageContent';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function IncomeTaxRefundPage() {
  const t = useTranslations('incomeTaxRefund');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `${t('description')}\n\n${t('details')}`;
  const { pageContent, loading } = usePageContent('incometaxrefund', t('title'), fallbackContent);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const title = pageContent?.title || t('title');
  const content = sanitizeHtmlContent(pageContent?.content || fallbackContent);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{title}</h1>
            <div 
              className="text-lg text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('benefits')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('benefit1')}</h3>
                <p className="text-gray-600">Quick turnaround times for your refund</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('benefit2')}</h3>
                <p className="text-gray-600">Professional guidance throughout the process</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('benefit3')}</h3>
                <p className="text-gray-600">We ensure you get the maximum refund possible</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('benefit4')}</h3>
                <p className="text-gray-600">Tailored service for your specific needs</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {tCommon('getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


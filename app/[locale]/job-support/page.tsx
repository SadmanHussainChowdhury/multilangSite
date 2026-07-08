'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePageContent } from '@/hooks/usePageContent';
import PageUnavailable from '@/components/PageUnavailable';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function JobSupportPage() {
  const t = useTranslations('jobSupport');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `<p class="text-xl text-gray-600 mb-6">${t('description')}</p>
<p class="text-lg text-gray-700 leading-relaxed">${t('details')}</p>`;
  const { pageContent, loading, isDeactivated } = usePageContent('job-support', t('title'), fallbackContent);

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

  if (isDeactivated) return <PageUnavailable />;

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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('services')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">{t('service1')}</h3>
                <p className="text-gray-600">Professional resume writing and optimization services</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">{t('service2')}</h3>
                <p className="text-gray-600">Comprehensive interview preparation and coaching</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">{t('service3')}</h3>
                <p className="text-gray-600">Active job search assistance and opportunities</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">{t('service4')}</h3>
                <p className="text-gray-600">Personalized career counseling and guidance</p>
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


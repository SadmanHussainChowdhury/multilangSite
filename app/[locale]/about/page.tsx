'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { usePageContent } from '@/hooks/usePageContent';
import PageUnavailable from '@/components/PageUnavailable';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function AboutPage() {
  const t = useTranslations('about');
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `${t('subtitle')}\n\n${t('description')}`;
  const { pageContent, loading, isDeactivated } = usePageContent('about', t('title'), fallbackContent);

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

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('mission')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('missionText')}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('vision')}</h2>
              <p className="text-gray-700 leading-relaxed">{t('visionText')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('services')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{t('service1')}</span>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{t('service2')}</span>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{t('service3')}</span>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{t('service4')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


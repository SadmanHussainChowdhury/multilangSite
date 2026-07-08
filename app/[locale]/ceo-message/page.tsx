'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { usePageContent } from '@/hooks/usePageContent';
import PageUnavailable from '@/components/PageUnavailable';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function CEOMessagePage() {
  const t = useTranslations('ceoMessage');
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `<p class="text-lg text-gray-700 font-semibold">${t('greeting')}</p>
<p class="text-lg text-gray-700 leading-relaxed">${t('message1')}</p>
<p class="text-lg text-gray-700 leading-relaxed">${t('message2')}</p>
<p class="text-lg text-gray-700 leading-relaxed">${t('message3')}</p>
<div class="mt-8 pt-8 border-t border-gray-200">
  <p class="text-gray-700">${t('signature')}</p>
  <p class="text-gray-800 font-semibold mt-2">${t('ceoName')}</p>
</div>`;
  const { pageContent, loading, isDeactivated } = usePageContent('ceo-message', t('title'), fallbackContent);

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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">{title}</h1>
          {pageContent?.imageUrl && (
            <div className="mb-8">
              <img 
                src={pageContent.imageUrl} 
                alt={title} 
                className="w-full max-h-96 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}


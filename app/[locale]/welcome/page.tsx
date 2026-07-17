'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { usePageContent } from '@/hooks/usePageContent';
import PageUnavailable from '@/components/PageUnavailable';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function WelcomePage() {
  const tCommon = useTranslations('common');
  
  // Try to fetch from database, fallback to default content
  const fallbackContent = `<p class="text-xl text-gray-600 mb-6">Welcome to our platform.</p>`;
  const { pageContent, loading, isDeactivated } = usePageContent('welcome', 'Welcome', fallbackContent);

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

  const title = pageContent?.title || 'Welcome';
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
        </div>
      </div>
    </div>
  );
}

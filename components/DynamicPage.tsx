'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Navigation from './Navigation';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

interface PageContent {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface DynamicPageProps {
  slug: string;
  fallbackContent?: {
    title: string;
    content: string;
  };
  children?: React.ReactNode;
}

export default function DynamicPage({ slug, fallbackContent, children }: DynamicPageProps) {
  const locale = useLocale();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState<number>(200); // track HTTP status

  const fetchPageContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${slug}?locale=${locale}`, {
        cache: 'no-store'
      });

      setPageStatus(response.status);

      if (response.ok) {
        const data = await response.json();
        setPageContent(data.data);
      } else if (response.status === 410) {
        // Page exists but is deactivated
        setPageContent(null);
      } else {
        // 404 or other error — use fallback
        if (fallbackContent) {
          setPageContent({
            title: fallbackContent.title,
            content: fallbackContent.content,
          });
        } else {
          setPageContent(null);
        }
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      if (fallbackContent) {
        setPageContent({
          title: fallbackContent.title,
          content: fallbackContent.content,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackContent, locale, slug]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

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

  // Page is deactivated (admin set it to inactive)
  if (pageStatus === 410) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Unavailable</h1>
            <p className="text-gray-500 mb-6">This page has been temporarily deactivated by the administrator.</p>
            <a href={`/${locale}`} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!pageContent && !fallbackContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p className="text-gray-600">The requested page could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const content = pageContent || fallbackContent!;
  const safeContent = sanitizeHtmlContent(content.content);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{content.title}</h1>
            <div 
              className="text-lg text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


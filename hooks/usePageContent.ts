'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

interface PageContent {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export function usePageContent(slug: string, fallbackTitle?: string, fallbackContent?: string) {
  const locale = useLocale();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, locale]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${slug}?locale=${locale}`);
      
      if (response.ok) {
        const data = await response.json();
        setPageContent(data.data);
      } else {
        // Use fallback content if page not found in DB
        if (fallbackTitle && fallbackContent) {
          setPageContent({
            title: fallbackTitle,
            content: fallbackContent,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      // Use fallback content on error
      if (fallbackTitle && fallbackContent) {
        setPageContent({
          title: fallbackTitle,
          content: fallbackContent,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { pageContent, loading };
}


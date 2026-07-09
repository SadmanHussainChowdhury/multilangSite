'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';

interface PageContent {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
}

export function usePageContent(slug: string, fallbackTitle?: string, fallbackContent?: string) {
  const locale = useLocale();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeactivated, setIsDeactivated] = useState(false);

  const fetchPageContent = useCallback(async () => {
    try {
      setLoading(true);
      setIsDeactivated(false);

      const response = await fetch(`/api/pages/${slug}?locale=${locale}`, {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setPageContent(data.data);
      } else if (response.status === 410) {
        // Page explicitly deactivated by admin — do NOT fall back to translation content
        setIsDeactivated(true);
        setPageContent(null);
      } else {
        // 404 or other error: page doesn't exist in DB → use fallback translation content
        if (fallbackTitle && fallbackContent) {
          setPageContent({
            title: fallbackTitle,
            content: fallbackContent,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      // Network/server error → use fallback
      if (fallbackTitle && fallbackContent) {
        setPageContent({
          title: fallbackTitle,
          content: fallbackContent,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [slug, locale, fallbackTitle, fallbackContent]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  return { pageContent, loading, isDeactivated };
}

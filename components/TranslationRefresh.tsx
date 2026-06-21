'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const POLL_INTERVAL_MS = 5000;

export default function TranslationRefresh() {
  const locale = useLocale();
  const router = useRouter();
  const lastVersionRef = useRef<number | null>(null);

  useEffect(() => {
    let ignore = false;

    async function checkVersion() {
      try {
        const response = await fetch(`/api/translations/version?locale=${locale}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const nextVersion = Number(data.version || 0);

        if (lastVersionRef.current === null) {
          lastVersionRef.current = nextVersion;
          return;
        }

        if (!ignore && nextVersion > lastVersionRef.current) {
          lastVersionRef.current = nextVersion;
          router.refresh();
        }
      } catch {
        // Keep the UI quiet if the lightweight realtime check is unavailable.
      }
    }

    lastVersionRef.current = null;
    checkVersion();
    const interval = window.setInterval(checkVersion, POLL_INTERVAL_MS);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, [locale, router]);

  return null;
}

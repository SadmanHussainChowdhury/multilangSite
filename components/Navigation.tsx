'use client';

'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useSession, signOut } from 'next-auth/react';

interface Logo {
  name?: string;
  imageUrl: string;
  altText?: string;
}

export default function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [navigationVisibility, setNavigationVisibility] = useState<Record<string, boolean>>({});
  const [customPages, setCustomPages] = useState<{ slug: string, title: string }[]>([]);

  const fetchLogo = useCallback(async () => {
    try {
      setLogoLoading(true);
      const response = await fetch(`/api/logo?locale=${locale}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setLogo(data.data);
      } else {
        // Fallback to text logo if no logo in database
        setLogo(null);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      setLogo(null);
    } finally {
      setLogoLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  const fetchNavigationVisibility = useCallback(async () => {
    try {
      const response = await fetch(`/api/navigation?locale=${locale}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setNavigationVisibility(data.data || {});
        setCustomPages(data.customPages || []);
      }
    } catch (error) {
      console.error('Error fetching navigation visibility:', error);
    }
  }, [locale]);

  useEffect(() => {
    fetchNavigationVisibility();
  }, [fetchNavigationVisibility]);

  const isVisible = (slug: string) => navigationVisibility[slug] !== false;
  const showAboutMenu = isVisible('about') || isVisible('ceo-message') || isVisible('contact');
  const showTaxMenu = isVisible('incometaxrefund') || isVisible('houserenttaxrefund') || isVisible('familytaxrefund');

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 premium-shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${locale}`} className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            {logoLoading ? (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg animate-pulse"></div>
            ) : logo && logo.imageUrl ? (
              <>
                <img
                  src={logo.imageUrl}
                  alt={logo.altText || 'Logo'}
                  className="h-10 w-auto object-contain"
                  onError={() => {
                    setLogo(null);
                  }}
                />
                {logo.name && (
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline-block">
                    {logo.name}
                  </span>
                )}
              </>
            ) : (
              <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MultiLang Site
              </span>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {showAboutMenu && (
              <div className="relative group">
                <button className="flex items-center gap-1 text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                  {t('aboutUs')}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 glass rounded-xl premium-shadow-lg border border-white/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2">
                    {isVisible('about') && (
                      <Link href={`/${locale}/about`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('about')}
                      </Link>
                    )}
                    {isVisible('ceo-message') && (
                      <Link href={`/${locale}/ceo-message`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('ceoMessage')}
                      </Link>
                    )}
                    {isVisible('contact') && (
                      <Link href={`/${locale}/contact`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('contactUs')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showTaxMenu && (
              <div className="relative group">
                <button className="flex items-center gap-1 text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                  {t('taxRefund')}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-56 glass rounded-xl premium-shadow-lg border border-white/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2">
                    {isVisible('incometaxrefund') && (
                      <Link href={`/${locale}/incometaxrefund`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('incomeTaxRefund')}
                      </Link>
                    )}
                    {isVisible('houserenttaxrefund') && (
                      <Link href={`/${locale}/houserenttaxrefund`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('houseRentTaxRefund')}
                      </Link>
                    )}
                    {isVisible('familytaxrefund') && (
                      <Link href={`/${locale}/familytaxrefund`} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2">
                        {t('familyTaxRefund')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isVisible('visa-changes') && (
              <Link href={`/${locale}/visa-changes`} className="text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                {t('visaChanges')}
              </Link>
            )}
            {isVisible('job-support') && (
              <Link href={`/${locale}/job-support`} className="text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                {t('jobSupport')}
              </Link>
            )}
            {isVisible('supported-countries') && (
              <Link href={`/${locale}/supported-countries`} className="text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                {t('helpSupport')}
              </Link>
            )}

            {/* Custom Pages */}
            {customPages.map(page => (
              <Link key={page.slug} href={`/${locale}/${page.slug}`} className="text-slate-700 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105">
                {page.title}
              </Link>
            ))}
            {status === 'authenticated' ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="px-4 py-2 border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                Sign out
              </button>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="px-4 py-2 border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                Sign in
              </Link>
            )}
            {status === 'authenticated' && session?.user?.role === 'admin' && (
              <Link
                href={`/${locale}/admin`}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 premium-shadow hover:scale-105"
              >
                Admin
              </Link>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {showAboutMenu && (
                <div>
                  <p className="px-4 py-2 font-semibold text-gray-700">{t('aboutUs')}</p>
                  {isVisible('about') && (
                    <Link href={`/${locale}/about`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('about')}
                    </Link>
                  )}
                  {isVisible('ceo-message') && (
                    <Link href={`/${locale}/ceo-message`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('ceoMessage')}
                    </Link>
                  )}
                  {isVisible('contact') && (
                    <Link href={`/${locale}/contact`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('contactUs')}
                    </Link>
                  )}
                </div>
              )}
              {showTaxMenu && (
                <div>
                  <p className="px-4 py-2 font-semibold text-gray-700">{t('taxRefund')}</p>
                  {isVisible('incometaxrefund') && (
                    <Link href={`/${locale}/incometaxrefund`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('incomeTaxRefund')}
                    </Link>
                  )}
                  {isVisible('houserenttaxrefund') && (
                    <Link href={`/${locale}/houserenttaxrefund`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('houseRentTaxRefund')}
                    </Link>
                  )}
                  {isVisible('familytaxrefund') && (
                    <Link href={`/${locale}/familytaxrefund`} className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      {t('familyTaxRefund')}
                    </Link>
                  )}
                </div>
              )}
              {isVisible('visa-changes') && (
                <Link href={`/${locale}/visa-changes`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t('visaChanges')}
                </Link>
              )}
              {isVisible('job-support') && (
                <Link href={`/${locale}/job-support`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t('jobSupport')}
                </Link>
              )}
              {isVisible('supported-countries') && (
                <Link href={`/${locale}/supported-countries`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t('helpSupport')}
                </Link>
              )}
              {status === 'authenticated' && session?.user?.role === 'admin' && (
                <Link href={`/${locale}/admin`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-semibold">
                  Admin Panel
                </Link>
              )}
              {status === 'authenticated' ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Sign out
                </button>
              ) : (
                <Link href={`/${locale}/auth/login`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-semibold">
                  Sign in
                </Link>
              )}
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


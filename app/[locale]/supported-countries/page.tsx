'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import { usePageContent } from '@/hooks/usePageContent';
import PageUnavailable from '@/components/PageUnavailable';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

const defaultCountries = [
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
];

export default function SupportedCountriesPage() {
  const t = useTranslations('supportedCountries');
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `<p class="text-xl text-gray-600 mb-2">${t('subtitle')}</p>
<p class="text-lg text-gray-700">${t('description')}</p>`;
  const { pageContent, loading, isDeactivated } = usePageContent('supported-countries', t('title'), fallbackContent);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Navigation />
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold premium-shadow">
                Global Services
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <div 
              className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <div className="glass rounded-2xl premium-shadow-lg p-8 md:p-12 border border-white/30 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {defaultCountries.map((country) => (
                <div
                  key={country.code}
                  className="group flex flex-col items-center p-6 glass rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 hover:border-blue-300 premium-shadow"
                >
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{country.flag}</div>
                  <h3 className="text-lg font-bold text-slate-800 text-center">
                    {country.name}
                  </h3>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4 text-lg">
                Need assistance? Contact us to learn more about services available in your country.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


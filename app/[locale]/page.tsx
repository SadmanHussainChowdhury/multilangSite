'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import { usePageContent } from '@/hooks/usePageContent';
import { sanitizeHtmlContent } from '@/lib/sanitizeHtml';

export default function HomePage() {
  const t = useTranslations('common');
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  
  // Try to fetch from database, fallback to translations
  const fallbackContent = `<p class="text-2xl md:text-3xl font-semibold mb-6 text-slate-700">${tHome('subtitle')}</p>
<p class="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">${tHome('description')}</p>`;
  const { pageContent, loading } = usePageContent('home', tHome('title'), fallbackContent);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const title = pageContent?.title || tHome('title');
  const heroContent = sanitizeHtmlContent(pageContent?.content || fallbackContent);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      
      {/* Ultra Premium Blue Cover Photo Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
        {/* Premium Blue Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 via-indigo-900 to-purple-900"></div>
        
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block mb-6 animate-fade-in">
              <span className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-full text-sm font-semibold border border-white/30 premium-shadow">
                Premium Tax Services
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                {title}
              </span>
            </h1>
            
            <div 
              className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in prose prose-invert max-w-none"
              style={{ animationDelay: '0.2s' }}
              dangerouslySetInnerHTML={{ __html: heroContent }}
            />
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link
                href={`/${locale}/contact`}
                className="group relative px-12 py-5 bg-gradient-to-r from-white to-blue-50 text-blue-900 font-bold rounded-2xl premium-shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden text-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('getStarted')}
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href={`/${locale}/about`}
                className="px-12 py-5 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl premium-shadow hover:scale-110 transition-all duration-300 border-2 border-white/30 hover:border-white/50 text-lg"
              >
                {t('learnMore')}
              </Link>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 text-slate-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,80 1200,40 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-20 relative z-10">
        {/* Premium Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
          <div className="group relative glass rounded-2xl p-8 premium-shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 premium-shadow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">{tNav('incomeTaxRefund')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Get your income tax refund processed quickly and efficiently.
              </p>
              <Link 
                href={`/${locale}/incometaxrefund`} 
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-indigo-600 transition-colors group"
              >
                {t('readMore')}
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="group relative glass rounded-2xl p-8 premium-shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 premium-shadow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">{tNav('houseRentTaxRefund')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Claim your house rent tax refund with our expert assistance.
              </p>
              <Link 
                href={`/${locale}/houserenttaxrefund`} 
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-pink-600 transition-colors group"
              >
                {t('readMore')}
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="group relative glass rounded-2xl p-8 premium-shadow-lg hover:scale-105 transition-all duration-300 border border-white/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 premium-shadow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">{tNav('familyTaxRefund')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Maximize your family tax refund benefits with our services.
              </p>
              <Link 
                href={`/${locale}/familytaxrefund`} 
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-blue-600 transition-colors group"
              >
                {t('readMore')}
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/20 premium-shadow mb-6">
      <div className="container mx-auto px-4">
        <div className="flex space-x-2 overflow-x-auto">
          <Link
            href={`/${locale}/admin`}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
              isActive('/admin') && !isActive('/admin/registrations') && !isActive('/admin/pages') && !isActive('/admin/footer') && !isActive('/admin/translations')
                ? 'text-blue-600'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </span>
            {isActive('/admin') && !isActive('/admin/registrations') && !isActive('/admin/pages') && !isActive('/admin/footer') && !isActive('/admin/translations') && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <Link
            href={`/${locale}/admin/registrations`}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
              isActive('/admin/registrations')
                ? 'text-blue-600'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registrations
            </span>
            {isActive('/admin/registrations') && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <Link
            href={`/${locale}/admin/pages`}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
              isActive('/admin/pages')
                ? 'text-blue-600'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Pages
            </span>
            {isActive('/admin/pages') && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          <Link
            href={`/${locale}/admin/footer`}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
              isActive('/admin/footer')
                ? 'text-blue-600'
                : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Footer
            </span>
            {isActive('/admin/footer') && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
            <Link
              href={`/${locale}/admin/translations`}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
                isActive('/admin/translations')
                  ? 'text-blue-600'
                  : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translations
              </span>
              {isActive('/admin/translations') && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href={`/${locale}/admin/logo`}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative group ${
                isActive('/admin/logo')
                  ? 'text-blue-600'
                  : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Logo
              </span>
              {isActive('/admin/logo') && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
        </div>
      </div>
    </nav>
  );
}


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

interface FooterData {
  companyName: string;
  companyDescription?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  quickLinks?: Array<{
    title: string;
    url: string;
  }>;
  services?: Array<{
    title: string;
    url: string;
  }>;
  copyrightText?: string;
}

interface Logo {
  imageUrl: string;
  altText?: string;
}

export default function Footer() {
  const locale = useLocale();
  const pathname = usePathname();
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooter();
  }, [locale]);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const [footerResponse, logoResponse] = await Promise.all([
        fetch(`/api/footer?locale=${locale}`),
        fetch(`/api/logo?locale=${locale}`),
      ]);
      
      if (footerResponse.ok) {
        const data = await footerResponse.json();
        setFooterData(data.data);
      } else {
        // Use default footer if not found in DB
        setFooterData({
          companyName: 'MultiLang Site',
          companyDescription: 'Your trusted partner for tax refund services',
          copyrightText: `© ${new Date().getFullYear()} MultiLang Site. All rights reserved.`,
        });
      }

      if (logoResponse.ok) {
        const logoData = await logoResponse.json();
        setLogo(logoData.data);
      }
    } catch (error) {
      console.error('Error fetching footer:', error);
      // Use default footer on error
      setFooterData({
        companyName: 'MultiLang Site',
        companyDescription: 'Your trusted partner for tax refund services',
        copyrightText: `© ${new Date().getFullYear()} MultiLang Site. All rights reserved.`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (pathname.includes('/admin')) {
    return null;
  }

  if (loading) {
    return null;
  }

  if (!footerData) {
    return null;
  }

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
                {logo && logo.imageUrl ? (
                  <img
                    src={logo.imageUrl}
                    alt={logo.altText || footerData.companyName}
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<h3 class="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">${footerData.companyName}</h3>`;
                      }
                    }}
                  />
                ) : (
                  <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {footerData.companyName}
                  </h3>
                )}
              </Link>
              {footerData.companyDescription && (
                <p className="text-slate-300 leading-relaxed">
                  {footerData.companyDescription}
                </p>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {footerData.address && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-slate-300 text-sm">{footerData.address}</p>
                </div>
              )}
              {footerData.phone && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${footerData.phone}`} className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                    {footerData.phone}
                  </a>
                </div>
              )}
              {footerData.email && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${footerData.email}`} className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                    {footerData.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          {footerData.quickLinks && footerData.quickLinks.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {footerData.quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.url.startsWith('http') ? link.url : link.url.startsWith('/') ? `/${locale}${link.url}` : `/${locale}/${link.url}`}
                      className="text-slate-300 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {footerData.services && footerData.services.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Our Services</h4>
              <ul className="space-y-3">
                {footerData.services.map((service, index) => (
                  <li key={index}>
                    <Link
                      href={service.url.startsWith('http') ? service.url : service.url.startsWith('/') ? `/${locale}${service.url}` : `/${locale}/${service.url}`}
                      className="text-slate-300 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Media */}
          {footerData.socialLinks && Object.keys(footerData.socialLinks).length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Follow Us</h4>
              <div className="flex flex-wrap gap-4">
                {footerData.socialLinks.facebook && (
                  <a
                    href={footerData.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600/20 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 premium-shadow"
                  >
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {footerData.socialLinks.twitter && (
                  <a
                    href={footerData.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-cyan-600/20 hover:bg-cyan-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 premium-shadow"
                  >
                    <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {footerData.socialLinks.linkedin && (
                  <a
                    href={footerData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-700/20 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 premium-shadow"
                  >
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {footerData.socialLinks.instagram && (
                  <a
                    href={footerData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-pink-600/20 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 premium-shadow"
                  >
                    <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {footerData.socialLinks.youtube && (
                  <a
                    href={footerData.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-red-600/20 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 premium-shadow"
                  >
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              {footerData.copyrightText || `© ${new Date().getFullYear()} ${footerData.companyName}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Made with</span>
              <svg className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>for you</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


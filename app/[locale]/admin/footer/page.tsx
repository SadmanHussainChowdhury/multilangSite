'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import AdminNav from '@/components/AdminNav';

interface FooterData {
  locale: string;
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
  isActive: boolean;
}

export default function AdminFooterPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FooterData>({
    locale: locale,
    companyName: '',
    companyDescription: '',
    address: '',
    phone: '',
    email: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
    },
    quickLinks: [],
    services: [],
    copyrightText: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFooter();
  }, [locale]);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/footer?locale=${locale}`);
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...data.data,
          quickLinks: data.data.quickLinks || [],
          services: data.data.services || [],
          socialLinks: data.data.socialLinks || {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: '',
            youtube: '',
          },
        });
      } else {
        // Initialize with default values
        setFormData({
          ...formData,
          locale: locale,
        });
      }
    } catch (error) {
      toast.error('Error loading footer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
  };

  const handleAddLink = (type: 'quickLinks' | 'services') => {
    setFormData({
      ...formData,
      [type]: [
        ...(formData[type] || []),
        { title: '', url: '' },
      ],
    });
  };

  const handleRemoveLink = (type: 'quickLinks' | 'services', index: number) => {
    const links = [...(formData[type] || [])];
    links.splice(index, 1);
    setFormData({
      ...formData,
      [type]: links,
    });
  };

  const handleLinkChange = (type: 'quickLinks' | 'services', index: number, field: 'title' | 'url', value: string) => {
    const links = [...(formData[type] || [])];
    links[index] = { ...links[index], [field]: value };
    setFormData({
      ...formData,
      [type]: links,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Footer saved successfully');
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: any) => {
            toast.error(`${err.path}: ${err.message}`);
          });
        } else {
          toast.error(data.message || 'Failed to save footer');
        }
      }
    } catch (error) {
      toast.error('Error saving footer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Footer Management</h1>
            <p className="text-gray-600 mt-1">Manage footer content for {locale.toUpperCase()} language</p>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl premium-shadow-lg p-8 border border-white/30">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Language
                    </label>
                    <select
                      value={formData.locale}
                      onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="bn">Bengali</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Company Description
                  </label>
                  <textarea
                    name="companyDescription"
                    rows={3}
                    value={formData.companyDescription}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Social Media Links</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks?.youtube || ''}
                      onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Quick Links</h2>
                  <button
                    type="button"
                    onClick={() => handleAddLink('quickLinks')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    + Add Link
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.quickLinks?.map((link, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleLinkChange('quickLinks', index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          URL
                        </label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleLinkChange('quickLinks', index, 'url', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="/about"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink('quickLinks', index)}
                        className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Links */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Services Links</h2>
                  <button
                    type="button"
                    onClick={() => handleAddLink('services')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    + Add Service
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.services?.map((service, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => handleLinkChange('services', index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          URL
                        </label>
                        <input
                          type="text"
                          value={service.url}
                          onChange={(e) => handleLinkChange('services', index, 'url', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="/incometaxrefund"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink('services', index)}
                        className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copyright */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Copyright Text
                </label>
                <input
                  type="text"
                  name="copyrightText"
                  value={formData.copyrightText}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Footer
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


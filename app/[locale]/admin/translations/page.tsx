'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import Navigation from '@/components/Navigation';
import AdminNav from '@/components/AdminNav';
import { locales, localeNames } from '@/i18n/config';

interface Translation {
  _id: string;
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  updatedAt: string;
}

export default function AdminTranslationsPage() {
  const locale = useLocale();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocale, setFilterLocale] = useState<string>('all');
  const [filterNamespace, setFilterNamespace] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewWindow, setPreviewWindow] = useState<Window | null>(null);
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, [filterLocale, filterNamespace, search]);

  // Cleanup preview window on unmount
  useEffect(() => {
    return () => {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }
    };
  }, [previewWindow]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterLocale !== 'all') params.set('locale', filterLocale);
      if (filterNamespace !== 'all') params.set('namespace', filterNamespace);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/translations?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTranslations(data.data);
      } else {
        toast.error('Failed to fetch translations');
      }
    } catch (error) {
      toast.error('Error fetching translations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingId(translation._id);
    setEditValue(translation.value);
  };

  const handleSave = async (id: string) => {
    try {
      const translation = translations.find((t) => t._id === id);
      if (!translation) return;

      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: editValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear translation cache immediately
        await fetch('/api/admin/translations/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: translation.locale }),
        });

        // Force refresh translations API to update cache
        await fetch(`/api/translations/refresh?locale=${translation.locale}&force=true`);

        // Force refresh if live preview is active
        if (isLivePreview && previewWindow && !previewWindow.closed) {
          // Small delay to ensure cache is cleared
          setTimeout(() => {
            previewWindow.location.reload();
          }, 100);
        }

        toast.success('Translation updated successfully! Changes are live now.');
        setEditingId(null);
        fetchTranslations();
      } else {
        toast.error(data.message || 'Failed to update translation');
      }
    } catch (error) {
      toast.error('Error updating translation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Clear translation cache
        const translation = translations.find((t) => t._id === id);
        if (translation) {
          await fetch('/api/admin/translations/clear-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: translation.locale }),
          });

          // Force refresh translations API to update cache
          await fetch(`/api/translations/refresh?locale=${translation.locale}&force=true`);
        }

        // Force refresh if live preview is active
        if (isLivePreview && previewWindow && !previewWindow.closed) {
          setTimeout(() => {
            previewWindow.location.reload();
          }, 100);
        }

        toast.success('Translation deleted! Changes are live now.');
        fetchTranslations();
      } else {
        toast.error('Failed to delete translation');
      }
    } catch (error) {
      toast.error('Error deleting translation');
    }
  };

  const handleBulkImport = async () => {
    try {
      // Import all translations from JSON files
      const locales = ['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh'];
      const translationsToImport: any[] = [];

      for (const loc of locales) {
        try {
          const messages = await import(`@/i18n/messages/${loc}.json`);
          const flatMessages = flattenObject(messages.default, loc);
          translationsToImport.push(...flatMessages);
        } catch (error) {
          console.error(`Error importing ${loc}:`, error);
        }
      }

      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translationsToImport),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear all translation cache
        await fetch('/api/admin/translations/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        // Force refresh all locales
        const locales = ['en', 'ar', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh'];
        await Promise.all(
          locales.map(loc => 
            fetch(`/api/translations/refresh?locale=${loc}&force=true`)
          )
        );

        // Force refresh if live preview is active
        if (isLivePreview && previewWindow && !previewWindow.closed) {
          setTimeout(() => {
            previewWindow.location.reload();
          }, 200);
        }

        toast.success(`Imported ${translationsToImport.length} translations! Changes are live now.`);
        fetchTranslations();
      } else {
        toast.error(data.message || 'Failed to import translations');
      }
    } catch (error) {
      toast.error('Error importing translations');
    }
  };

  const flattenObject = (obj: any, locale: string, prefix = '', namespace = ''): any[] => {
    const result: any[] = [];
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        result.push(...flattenObject(obj[key], locale, newKey, namespace || key));
      } else {
        result.push({
          key: newKey,
          locale,
          value: String(obj[key]),
          namespace: namespace || newKey.split('.')[0],
        });
      }
    }
    return result;
  };

  const namespaces = Array.from(new Set(translations.map((t) => t.namespace || 'common')));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navigation />
      <AdminNav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold premium-shadow">
              Language Management
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Translations
              </h1>
              <p className="text-xl text-slate-600">Manage all language translations dynamically</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isLivePreview && previewWindow && !previewWindow.closed) {
                    previewWindow.close();
                    setPreviewWindow(null);
                    setIsLivePreview(false);
                    toast.info('Live preview closed.');
                  } else {
                    const currentLocale = filterLocale !== 'all' ? filterLocale : locale;
                    const previewUrl = `/${currentLocale}`;
                    const newWindow = window.open(previewUrl, 'translation-preview', 'width=1200,height=800');
                    if (newWindow) {
                      setPreviewWindow(newWindow);
                      setIsLivePreview(true);
                      toast.success('Live preview opened! Changes will auto-refresh in real-time.');
                    }
                  }
                }}
                className={`px-6 py-3 font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300 ${
                  isLivePreview
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                }`}
              >
                {isLivePreview ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Live Preview Active
                  </span>
                ) : (
                  'Open Live Preview'
                )}
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/admin/translations/clear-cache', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  });
                  if (isLivePreview && previewWindow && !previewWindow.closed) {
                    previewWindow.location.reload();
                  }
                  toast.success('Translation cache cleared! Changes are live now.');
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                Clear Cache
              </button>
              <button
                onClick={handleBulkImport}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                Import from JSON
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl premium-shadow-lg p-6 mb-6 border border-white/30 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Filter by Language:
              </label>
              <select
                value={filterLocale}
                onChange={(e) => setFilterLocale(e.target.value)}
                className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
              >
              <option value="all">All Languages</option>
              {locales.map((loc) => (
                <option key={loc} value={loc}>
                  {localeNames[loc]}
                </option>
              ))}
            </select>
          </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Filter by Namespace:
              </label>
              <select
                value={filterNamespace}
                onChange={(e) => setFilterNamespace(e.target.value)}
                className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
              >
              <option value="all">All Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Search:
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keys or values..."
                className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl premium-shadow-lg overflow-hidden border border-white/30 animate-slide-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Namespace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {translations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No translations found. Click "Import from JSON" to import existing translations.
                    </td>
                  </tr>
                ) : (
                  translations.map((translation) => (
                    <tr key={translation._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {translation.key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {translation.locale.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {translation.namespace || 'common'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingId === translation._id ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        ) : (
                          <div className="max-w-md truncate">{translation.value}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {editingId === translation._id ? (
                          <>
                            <button
                              onClick={() => handleSave(translation._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditValue('');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(translation)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(translation._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


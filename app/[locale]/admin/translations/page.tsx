'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
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

const localeFlags: Record<string, string> = {
  vi: '🇻🇳', id: '🇮🇩', uz: '🇺🇿', mn: '🇲🇳', ne: '🇳🇵',
  my: '🇲🇲', si: '🇱🇰', bn: '🇧🇩', fil: '🇵🇭', km: '🇰🇭',
  th: '🇹🇭', en: '🇬🇧', ko: '🇰🇷',
};

export default function AdminTranslationsPage() {
  const adminLocale = useLocale();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<string>('en');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [importing, setImporting] = useState(false);
  const [localeCounts, setLocaleCounts] = useState<Record<string, number>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('locale', selectedLocale);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/translations?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTranslations(data.data);
      } else {
        toast.error('Failed to fetch translations');
      }
    } catch {
      toast.error('Error fetching translations');
    } finally {
      setLoading(false);
    }
  }, [selectedLocale, search]);

  // Fetch counts for all locales for the sidebar badges
  const fetchLocaleCounts = useCallback(async () => {
    try {
      const counts: Record<string, number> = {};
      const responses = await Promise.all(
        locales.map((loc) =>
          fetch(`/api/admin/translations?locale=${loc}`).then((r) => r.json())
        )
      );
      locales.forEach((loc, i) => {
        counts[loc] = responses[i]?.data?.length || 0;
      });
      setLocaleCounts(counts);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  useEffect(() => {
    fetchLocaleCounts();
  }, [fetchLocaleCounts]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingId]);

  const handleEdit = (translation: Translation) => {
    setEditingId(translation._id);
    setEditValue(translation.value);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (id: string) => {
    const translation = translations.find((t) => t._id === id);
    if (!translation) return;

    try {
      setSaving(id);
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state immediately for instant UI feedback
        setTranslations((prev) =>
          prev.map((t) => (t._id === id ? { ...t, value: editValue } : t))
        );
        setEditingId(null);
        setEditValue('');

        // Clear cache & bump version so frontend picks up change
        await fetch('/api/admin/translations/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: translation.locale }),
        });

        // Warm the cache with fresh data
        await fetch(`/api/translations/refresh?locale=${translation.locale}&force=true`);

        toast.success('✅ Translation saved! Frontend will update within 5s.');
      } else {
        toast.error(data.message || 'Failed to update translation');
      }
    } catch {
      toast.error('Error updating translation');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    const translation = translations.find((t) => t._id === id);
    try {
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTranslations((prev) => prev.filter((t) => t._id !== id));
        if (translation) {
          await fetch('/api/admin/translations/clear-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: translation.locale }),
          });
        }
        toast.success('Translation deleted.');
        fetchLocaleCounts();
      } else {
        toast.error('Failed to delete translation');
      }
    } catch {
      toast.error('Error deleting translation');
    }
  };

  const handleBulkImport = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/admin/translations/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        const skipped = data.skipped?.length ? ` (${data.skipped.length} locales skipped)` : '';
        toast.success(`✅ Imported ${data.count || 0} translations across ${data.locales?.length || 0} languages!${skipped}`);
        fetchTranslations();
        fetchLocaleCounts();
      } else {
        toast.error(data.message || 'Failed to import translations');
      }
    } catch (err: any) {
      toast.error('Error importing translations: ' + (err?.message || 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const handleClearCache = async () => {
    await fetch('/api/admin/translations/clear-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: selectedLocale }),
    });
    toast.success('Cache cleared for ' + localeNames[selectedLocale as keyof typeof localeNames]);
  };

  // Group translations by namespace
  const namespaces = Array.from(new Set(translations.map((t) => t.namespace || 'common'))).sort();

  const filteredTranslations = translations.filter((t) => {
    const matchesNamespace = selectedNamespace === 'all' || (t.namespace || 'common') === selectedNamespace;
    const matchesSearch = !search || 
      t.key.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase());
    return matchesNamespace && matchesSearch;
  });

  // Group filtered translations by namespace
  const grouped: Record<string, Translation[]> = {};
  filteredTranslations.forEach((t) => {
    const ns = t.namespace || 'common';
    if (!grouped[ns]) grouped[ns] = [];
    grouped[ns].push(t);
  });

  const selectedLocaleName = localeNames[selectedLocale as keyof typeof localeNames] || selectedLocale.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <AdminNav />

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* ── Sidebar: Language Selector ── */}
        <aside className="w-72 flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-white/30 overflow-y-auto premium-shadow-lg">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Select Language</h2>
            <p className="text-xs text-slate-500">Edit translations per language</p>
          </div>

          <nav className="p-3 space-y-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => { setSelectedLocale(loc); setSelectedNamespace('all'); setEditingId(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  selectedLocale === loc
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white premium-shadow scale-[1.02]'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  selectedLocale === loc
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  {localeCounts[loc] ?? '…'}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{localeFlags[selectedLocale]}</span>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedLocaleName}
                  </h1>
                </div>
                <p className="text-slate-500 text-sm">
                  {translations.length} translation keys • Edit values below to update the frontend in real-time
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl premium-shadow hover:scale-105 transition-all duration-200"
                >
                  🔄 Clear Cache
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={importing}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl premium-shadow hover:scale-105 transition-all duration-200 disabled:opacity-60"
                >
                  {importing ? '⏳ Importing…' : '📥 Import from JSON'}
                </button>
              </div>
            </div>

            {/* Search & Namespace filter */}
            <div className="glass rounded-2xl border border-white/30 p-4 mb-5 flex flex-col sm:flex-row gap-3 animate-slide-up">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search keys or values…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-sm transition-all outline-none"
                />
              </div>
              <select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="px-4 py-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-300 text-sm transition-all outline-none min-w-[160px]"
              >
                <option value="all">All Groups</option>
                {namespaces.map((ns) => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm">Loading translations…</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && translations.length === 0 && (
              <div className="glass rounded-2xl border border-white/30 p-12 text-center animate-fade-in">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No translations yet</h3>
                <p className="text-slate-500 mb-6">Click "Import from JSON" to seed the translations from your local JSON files.</p>
                <button
                  onClick={handleBulkImport}
                  disabled={importing}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl premium-shadow hover:scale-105 transition-all duration-200"
                >
                  {importing ? '⏳ Importing…' : '📥 Import from JSON'}
                </button>
              </div>
            )}

            {/* Grouped Translation Cards */}
            {!loading && Object.keys(grouped).sort().map((ns) => (
              <div key={ns} className="mb-6 animate-slide-up">
                {/* Namespace header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200">
                    {ns}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent" />
                </div>

                {/* Translation rows */}
                <div className="glass rounded-2xl border border-white/30 overflow-hidden premium-shadow">
                  {grouped[ns].map((translation, idx) => (
                    <div
                      key={translation._id}
                      className={`flex items-start gap-4 p-4 transition-all duration-200 ${
                        idx < grouped[ns].length - 1 ? 'border-b border-slate-100' : ''
                      } ${editingId === translation._id ? 'bg-blue-50/80' : 'hover:bg-white/60'}`}
                    >
                      {/* Key */}
                      <div className="w-56 flex-shrink-0 pt-1">
                        <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg break-all">
                          {translation.key.replace(`${ns}.`, '')}
                        </code>
                      </div>

                      {/* Value / Edit area */}
                      <div className="flex-1 min-w-0">
                        {editingId === translation._id ? (
                          <textarea
                            ref={textareaRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') handleCancel();
                              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave(translation._id);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white resize-none"
                            placeholder="Enter translation value…"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 leading-relaxed break-words line-clamp-2">
                            {translation.value || <span className="text-slate-400 italic">Empty</span>}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
                        {editingId === translation._id ? (
                          <>
                            <button
                              onClick={() => handleSave(translation._id)}
                              disabled={saving === translation._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-lg hover:scale-105 transition-all premium-shadow disabled:opacity-60"
                            >
                              {saving === translation._id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : '✓'} Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(translation)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 hover:scale-105 transition-all border border-blue-100"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(translation._id)}
                              className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 hover:scale-105 transition-all border border-red-100"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* No results from search */}
            {!loading && translations.length > 0 && filteredTranslations.length === 0 && (
              <div className="glass rounded-2xl border border-white/30 p-10 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-500">No translations match your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

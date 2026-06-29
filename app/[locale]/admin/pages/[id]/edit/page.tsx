'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import AdminNav from '@/components/AdminNav';
import { locales, localeNames } from '@/i18n/config';

interface Page {
  _id: string;
  title: string;
  content: string;
  slug: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    locale: 'en',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  });

  // Image upload helper state
  const [showImageHelper, setShowImageHelper] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgUploadMethod, setImgUploadMethod] = useState<'file' | 'url'>('file');

  const loadPage = useCallback(async () => {
    try {
      const resolvedParams = await params;
      setPageId(resolvedParams.id);

      const response = await fetch(`/api/admin/pages/${resolvedParams.id}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const page: Page = data.data;
        setFormData({
          title: page.title,
          content: page.content,
          slug: page.slug,
          locale: page.locale,
          metaTitle: page.metaTitle || '',
          metaDescription: page.metaDescription || '',
          isActive: page.isActive,
        });
      } else {
        toast.error('Failed to load page');
        router.push(`/${locale}/admin/pages`);
      }
    } catch (error) {
      toast.error('Error loading page');
      router.push(`/${locale}/admin/pages`);
    } finally {
      setLoading(false);
    }
  }, [locale, params, router]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'slug' ? generateSlug(value) : value,
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setImgUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgUrl(reader.result as string);
      setImgUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setImgUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const insertImageTag = () => {
    if (!imgUrl) {
      toast.error('Please provide an image URL or upload a file');
      return;
    }
    const tag = `<img src="${imgUrl}" alt="${imgAlt}" style="max-width:100%;height:auto;" />`;
    setFormData((prev) => ({ ...prev, content: prev.content + '\n' + tag }));
    setShowImageHelper(false);
    setImgUrl('');
    setImgAlt('');
    toast.success('Image inserted into content');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Page updated successfully');
        router.push(`/${locale}/admin/pages`);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: any) => {
            toast.error(`${err.path}: ${err.message}`);
          });
        } else {
          toast.error(data.message || 'Failed to update page');
        }
      }
    } catch (error) {
      toast.error('Error updating page');
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Edit Page</h1>
            <p className="text-gray-600 mt-1">Update page content and settings</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="locale" className="block text-sm font-semibold text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="locale"
                    name="locale"
                    required
                    value={formData.locale}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {locales.map((loc) => (
                      <option key={loc} value={loc}>
                        {localeNames[loc]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Active (visible on website)
                  </label>
                </div>
              </div>

              {/* Image Upload Helper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImageHelper(!showImageHelper)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {showImageHelper ? 'Hide Image Helper' : 'Insert Image'}
                  </button>
                </div>

                {/* Image Upload Panel */}
                {showImageHelper && (
                  <div className="mb-4 p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50">
                    <h3 className="text-sm font-bold text-indigo-800 mb-3">Insert Image into Content</h3>

                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => { setImgUploadMethod('file'); setImgUrl(''); }}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${imgUploadMethod === 'file' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImgUploadMethod('url'); setImgUrl(''); }}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${imgUploadMethod === 'url' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
                      >
                        Enter URL
                      </button>
                    </div>

                    {imgUploadMethod === 'file' && (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer bg-white hover:bg-indigo-50 transition mb-3">
                        {imgUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
                            <span className="text-sm text-indigo-700">Processing...</span>
                          </div>
                        ) : imgUrl ? (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-green-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-600">Image loaded — ready to insert</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-indigo-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-indigo-700"><span className="font-semibold">Click to upload</span> PNG, JPG, GIF (max 5MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} disabled={imgUploading} />
                      </label>
                    )}

                    {imgUploadMethod === 'url' && (
                      <input
                        type="url"
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-3 text-sm"
                      />
                    )}

                    {imgUrl && (
                      <div className="mb-3 p-2 bg-white rounded-lg border border-indigo-200">
                        <img src={imgUrl} alt="preview" className="max-h-24 object-contain" />
                      </div>
                    )}

                    <input
                      type="text"
                      value={imgAlt}
                      onChange={(e) => setImgAlt(e.target.value)}
                      placeholder="Alt text (accessibility description)"
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-400 mb-3 text-sm"
                    />

                    <button
                      type="button"
                      onClick={insertImageTag}
                      disabled={!imgUrl}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Insert Image Tag
                    </button>
                  </div>
                )}

                <textarea
                  id="content"
                  name="content"
                  required
                  rows={15}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">You can use HTML tags for formatting. Use &quot;Insert Image&quot; above to add images.</p>
              </div>

              <div>
                <label htmlFor="metaTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

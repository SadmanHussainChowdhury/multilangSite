'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import AdminNav from '@/components/AdminNav';

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  altText?: string;
  locale?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLogoPage() {
  const locale = useLocale();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    altText: '',
    locale: 'en',
    isActive: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/logo');
      const data = await response.json();

      if (response.ok) {
        setLogos(data.data);
      } else {
        toast.error('Failed to fetch logos');
      }
    } catch (error) {
      toast.error('Error fetching logos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({
          ...formData,
          imageUrl: base64String,
        });
        setUploading(false);
        toast.success('Image loaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing file');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that image is provided
    if (!formData.imageUrl) {
      toast.error('Please upload an image or enter an image URL');
      return;
    }

    try {
      const url = editingId ? `/api/admin/logo/${editingId}` : '/api/admin/logo';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingId ? 'Logo updated successfully' : 'Logo created successfully');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          imageUrl: '',
          altText: '',
          locale: 'en',
          isActive: true,
        });
        setSelectedFile(null);
        setUploadMethod('file');
        fetchLogos();
      } else {
        toast.error(data.message || 'Failed to save logo');
      }
    } catch (error) {
      toast.error('Error saving logo');
    }
  };

  const handleEdit = (logo: Logo) => {
    setEditingId(logo._id);
    setFormData({
      name: logo.name,
      imageUrl: logo.imageUrl,
      altText: logo.altText || '',
      locale: logo.locale || 'en',
      isActive: logo.isActive,
    });
    // Determine upload method based on imageUrl
    setUploadMethod(logo.imageUrl.startsWith('data:') ? 'file' : 'url');
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/logo/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Logo deleted successfully');
        fetchLogos();
      } else {
        toast.error('Failed to delete logo');
      }
    } catch (error) {
      toast.error('Error deleting logo');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/logo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Logo ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchLogos();
      } else {
        toast.error('Failed to update logo');
      }
    } catch (error) {
      toast.error('Error updating logo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700">Loading...</p>
        </div>
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

      <AdminNav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold premium-shadow">
              Brand Management
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Logo Management
              </h1>
              <p className="text-xl text-slate-600">Manage your website logo dynamically</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    imageUrl: '',
                    altText: '',
                    locale: 'en',
                    isActive: true,
                  });
                  setSelectedFile(null);
                  setUploadMethod('file');
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
            >
              {showForm ? 'Cancel' : '+ Add Logo'}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl premium-shadow-lg p-8 mb-6 border border-white/30 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Logo' : 'Add New Logo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Logo Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                  placeholder="e.g., Main Logo, Dark Mode Logo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Logo Image <span className="text-red-500">*</span>
                </label>
                
                {/* Upload Method Toggle */}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMethod('file');
                      setFormData({ ...formData, imageUrl: '' });
                      setSelectedFile(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      uploadMethod === 'file'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white premium-shadow'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Upload from Computer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMethod('url');
                      setFormData({ ...formData, imageUrl: '' });
                      setSelectedFile(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      uploadMethod === 'url'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white premium-shadow'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Enter URL
                  </button>
                </div>

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-300">
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm font-semibold text-slate-700">Processing image...</p>
                        </div>
                      ) : selectedFile ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-slate-700 mb-1">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFile(null);
                              setFormData({ ...formData, imageUrl: '' });
                            }}
                            className="mt-2 px-4 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            <span className="text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG, GIF, SVG (MAX. 5MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <input
                    type="url"
                    name="imageUrl"
                    required={uploadMethod === 'url'}
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                    placeholder="https://example.com/logo.png"
                  />
                )}

                {/* Preview */}
                {formData.imageUrl && (
                  <div className="mt-4 p-4 glass rounded-xl border border-white/30">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt={formData.altText || formData.name}
                      className="max-h-32 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Alt Text
                </label>
                <input
                  type="text"
                  name="altText"
                  value={formData.altText}
                  onChange={handleChange}
                  className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                  placeholder="Logo description for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Language (Optional)
                </label>
                <select
                  name="locale"
                  value={formData.locale}
                  onChange={handleChange}
                  className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                >
                  <option value="en">Default (All Languages)</option>
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
                <p className="text-xs text-slate-500 mt-2">
                  Leave as "Default" to use for all languages, or select a specific language
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-2 border-blue-500 text-blue-600 focus:ring-2 focus:ring-blue-200"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                  Active
                </label>
              </div>

              <button
                type="submit"
                disabled={!formData.imageUrl || uploading}
                className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300 ${
                  !formData.imageUrl || uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Processing...' : editingId ? 'Update Logo' : 'Create Logo'}
              </button>
            </form>
          </div>
        )}

        {/* Logos List */}
        <div className="glass rounded-2xl premium-shadow-lg overflow-hidden border border-white/30 animate-slide-up">
          {logos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">No logos found</h3>
              <p className="text-sm text-slate-600 mt-2">Click "Add Logo" to create your first logo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200/50">
                  {logos.map((logo) => (
                    <tr key={logo._id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={logo.imageUrl}
                          alt={logo.altText || logo.name}
                          className="h-12 w-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {logo.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {logo.locale ? logo.locale.toUpperCase() : 'All'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToggleActive(logo._id, logo.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            logo.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {logo.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(logo)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(logo._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


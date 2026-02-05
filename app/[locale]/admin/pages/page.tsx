'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import AdminNav from '@/components/AdminNav';

interface Page {
  _id: string;
  title: string;
  slug: string;
  locale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RouteStatus {
  slug: string;
  name: string;
  route: string;
  hasPage: boolean;
  pageId?: string;
  isActive: boolean;
  lastUpdated: string | null;
}

export default function AdminPagesPage() {
  const locale = useLocale();
  const [pages, setPages] = useState<Page[]>([]);
  const [routeStatus, setRouteStatus] = useState<RouteStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocale, setFilterLocale] = useState<string>('all');
  const [showRouteStatus, setShowRouteStatus] = useState(true);

  useEffect(() => {
    fetchPages();
    fetchRouteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLocale]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const url = filterLocale !== 'all' 
        ? `/api/admin/pages?locale=${filterLocale}`
        : '/api/admin/pages';
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setPages(data.data);
      } else {
        toast.error('Failed to fetch pages');
      }
    } catch (error) {
      toast.error('Error fetching pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteStatus = async () => {
    try {
      const currentLocale = filterLocale !== 'all' ? filterLocale : locale;
      const response = await fetch(`/api/admin/pages/check-routes?locale=${currentLocale}`);
      const data = await response.json();

      if (response.ok) {
        setRouteStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching route status:', error);
    }
  };

  const handleQuickCreate = async (route: RouteStatus) => {
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: route.name,
          slug: route.slug,
          locale: filterLocale !== 'all' ? filterLocale : locale,
          content: `<h2>${route.name}</h2><p>This page content can be edited through the admin panel.</p>`,
          isActive: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Page "${route.name}" created successfully`);
        fetchPages();
        fetchRouteStatus();
      } else {
        toast.error(data.message || 'Failed to create page');
      }
    } catch (error) {
      toast.error('Error creating page');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Page deleted');
        fetchPages();
      } else {
        toast.error('Failed to delete page');
      }
    } catch (error) {
      toast.error('Error deleting page');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const page = pages.find(p => p._id === id);
      if (!page) return;

      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...page,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Page ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchPages();
      } else {
        toast.error('Failed to update page');
      }
    } catch (error) {
      toast.error('Error updating page');
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
              Content Management
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pages Management
              </h1>
              <p className="text-xl text-slate-600">Manage all website pages</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRouteStatus(!showRouteStatus)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                {showRouteStatus ? 'Hide' : 'Show'} Route Status
              </button>
              <Link
                href={`/${locale}/admin/pages/new`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                + New Page
              </Link>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl premium-shadow-lg p-6 mb-6 border border-white/30 animate-slide-up">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Filter by Language:
          </label>
          <select
            value={filterLocale}
            onChange={(e) => setFilterLocale(e.target.value)}
            className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
          >
            <option value="all">All Languages</option>
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

        {/* Route Status Section */}
        {showRouteStatus && routeStatus.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Existing Routes Status</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {routeStatus.filter(r => r.hasPage).length} of {routeStatus.length} routes have pages
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routeStatus.map((route) => (
                <div
                  key={route.slug}
                  className={`p-4 rounded-lg border-2 ${
                    route.hasPage
                      ? route.isActive
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{route.name}</h3>
                      <p className="text-sm text-gray-600">{route.route}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        route.hasPage
                          ? route.isActive
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {route.hasPage ? (route.isActive ? 'Active' : 'Inactive') : 'Missing'}
                    </span>
                  </div>
                  {route.hasPage ? (
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/${locale}${route.route}`}
                          target="_blank"
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/${locale}/admin/pages/${route.pageId}/edit`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                      {route.lastUpdated && (
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(route.lastUpdated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickCreate(route)}
                      className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Quick Create
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No pages found. Create your first page!
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {page.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page.locale.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToggleActive(page._id, page.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            page.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/${page.locale}${page.slug === 'home' ? '' : '/' + page.slug}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/${locale}/admin/pages/${page._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(page._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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


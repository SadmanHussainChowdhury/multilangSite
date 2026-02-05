'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import AdminNav from '@/components/AdminNav';
import Link from 'next/link';

interface Registration {
  _id: string;
  name: string;
  alien_number: string;
  passport_number?: string;
  nationality: string;
  phone: string;
  visa_type: string;
  message?: string;
  country?: string;
  createdAt: string;
}

export default function AdminRegistrationsPage() {
  const locale = useLocale();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRegistrations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRegistrations, 30000);
    return () => clearInterval(interval);
  }, [currentPage, filterType]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filterType !== 'all' && { visa_type: filterType }),
      });

      const response = await fetch(`/api/admin/registrations?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRegistrations(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      } else {
        toast.error('Failed to fetch registrations');
      }
    } catch (error) {
      toast.error('Error fetching registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Registration deleted successfully');
        fetchRegistrations();
      } else {
        toast.error('Failed to delete registration');
      }
    } catch (error) {
      toast.error('Error deleting registration');
    }
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.alien_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm);
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Alien Number', 'Passport Number', 'Nationality', 'Phone', 'Service Type', 'Country', 'Date'];
    const rows = registrations.map((reg) => [
      reg.name,
      reg.alien_number,
      reg.passport_number || '',
      reg.nationality,
      reg.phone,
      reg.visa_type.replace('_', ' '),
      reg.country || '',
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

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
              Registration Management
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Registrations
              </h1>
              <p className="text-xl text-slate-600">
                Manage and view all registration submissions
                {totalCount > 0 && (
                  <span className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold">
                    {totalCount} total
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/admin`}
                className="px-6 py-3 glass text-slate-700 font-semibold rounded-xl premium-shadow hover:scale-105 transition-all duration-300 border border-white/30"
              >
                Dashboard
              </Link>
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                Export CSV
              </button>
              <button
                onClick={fetchRegistrations}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass rounded-2xl premium-shadow-lg p-6 mb-6 border border-white/30 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Search</label>
              <input
                type="text"
                placeholder="Search by name, alien number, nationality, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Filter by Service Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-5 py-3 glass border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
              >
                <option value="all">All Types</option>
                <option value="income_tax">Income Tax Refund</option>
                <option value="house_rent">House Rent Tax Refund</option>
                <option value="family_tax">Family Tax Refund</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl premium-shadow-lg overflow-hidden border border-white/30 animate-slide-up">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl font-semibold text-slate-700">Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-800">No registrations found</h3>
              <p className="mt-1 text-sm text-slate-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No registrations have been submitted yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/50">
                  <thead className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alien Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nationality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200/50">
                    {filteredRegistrations.map((registration) => (
                      <tr key={registration._id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {registration.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.alien_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.nationality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {registration.visa_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(registration)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(registration._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} registrations
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Registration Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="mt-1 text-gray-900">{selectedRegistration.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alien Registration Number</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.alien_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Passport Number</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.passport_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Type</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.visa_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.country || 'N/A'}</p>
                  </div>
                </div>

                {selectedRegistration.message && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Additional Information</label>
                    <p className="mt-1 text-gray-900">{selectedRegistration.message}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedRegistration.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedRegistration._id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

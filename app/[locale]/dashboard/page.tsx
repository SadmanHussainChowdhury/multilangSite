'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-700">Welcome, {session?.user?.name}</span>
              {session?.user?.role === 'admin' && (
                <Link
                  href={`/${locale}/admin/registrations`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h2>
          <p className="text-gray-600 mb-6">
            You are logged in as: <strong>{session?.user?.email}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Your role: <strong>{session?.user?.role}</strong>
          </p>
          <div className="flex gap-4">
            <Link
              href={`/${locale}/contact`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Contact Us
            </Link>
            <Link
              href={`/${locale}`}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center space-x-2 rounded-md bg-blue-700 px-6 py-3 text-base font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition-all"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            <span>Try again</span>
          </button>
          <Link
            href="/fr"
            className="inline-flex items-center space-x-2 rounded-md border-2 border-blue-700 px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition-all"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

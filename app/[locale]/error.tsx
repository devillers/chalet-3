// app/[locale]/error.tsx

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
  // Log l’erreur côté client pour le débogage
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <section className="text-center max-w-lg">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-8">
          Une erreur inattendue s’est produite. Vous pouvez réessayer ou revenir à
          l’accueil.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-md bg-[#bd9254] px-6 py-3 text-base font-semibold text-white hover:bg-[#a97f45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] focus-visible:ring-offset-2 transition-all"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Réessayer
          </button>

          <Link
            href="/fr"
            className="inline-flex items-center gap-2 rounded-md border-2 border-[#bd9254] px-6 py-3 text-base font-semibold text-[#bd9254] hover:bg-[#f9f5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] focus-visible:ring-offset-2 transition-all"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Accueil
          </Link>
        </div>
      </section>
    </main>
  );
}

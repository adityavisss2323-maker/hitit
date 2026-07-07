'use client';
// app/search/page.js
// VULN: Reflected XSS - search query rendered without sanitization
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [rawQuery, setRawQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setRawQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="input-dark pl-12"
              id="search-input"
            />
          </div>
          <button type="submit" className="btn-primary px-6" id="search-submit-btn">
            Search
          </button>
        </div>
      </form>

      {/* VULN: Reflected XSS - rawQuery rendered via dangerouslySetInnerHTML */}
      {searched && rawQuery && (
        <div className="mb-6">
          <p className="text-slate-400 text-sm">
            Search results for:{' '}
            {/* VULN: XSS - user input reflected without sanitization */}
            <span
              className="text-white font-semibold"
              dangerouslySetInnerHTML={{ __html: rawQuery }}
            />
          </p>
          <p className="text-slate-500 text-sm">{results.length} result(s) found</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : searched ? (
        results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400">No products found for your search.</p>
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500">Enter a search term above to find products.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Search Products</h1>
          <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
            <SearchContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

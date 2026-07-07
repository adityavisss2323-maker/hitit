'use client';
// app/products/page.js
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const categories = ['All', 'Electronics', 'Wearables', 'Storage', 'Accessories', 'Furniture', 'Home'];

  useEffect(() => {
    if (categoryParam) setCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    const url = category === 'All' ? '/api/products' : `/api/products?category=${encodeURIComponent(category)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              category === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            id={`category-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">All Products</h1>
            <p className="text-slate-400 mt-1">Browse our full catalog of premium tech products</p>
          </div>
          <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
            <ProductsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';
// app/products/[id]/page.js
// VULN: DOM XSS via URL hash fragment
import { useState, useEffect, use } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ReviewSection from '../../../components/ReviewSection';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    fetch(`/api/products/${resolvedParams.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          // VULN: Verbose error from Prisma may be returned
          setError(data.error);
        } else {
          setProduct(data.product);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });

    // VULN: DOM XSS - reads from location.hash and writes to innerHTML
    const handleShare = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Intentionally vulnerable: hash content inserted into DOM
        const msgEl = document.getElementById('share-message');
        if (msgEl) {
          msgEl.innerHTML = decodeURIComponent(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleShare);
    handleShare(); // Run on mount too

    return () => window.removeEventListener('hashchange', handleShare);
  }, [resolvedParams.id]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="skeleton rounded-2xl h-96" />
              <div className="space-y-4">
                <div className="skeleton h-8 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-10 w-1/3" />
              </div>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              {/* VULN: Verbose Prisma error exposed directly */}
              <p className="text-red-400" id="product-error">{error}</p>
            </div>
          ) : product ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {/* Image */}
                <div className="glass-card overflow-hidden rounded-2xl">
                  <img src={product.image} alt={product.name} className="w-full h-96 object-cover" />
                </div>

                {/* Product details */}
                <div className="space-y-6">
                  <div>
                    <span className="text-blue-400 text-sm font-medium bg-blue-400/10 px-3 py-1 rounded-full">{product.category}</span>
                    <h1 className="text-3xl font-bold text-white mt-3 mb-2">{product.name}</h1>
                    <p className="text-slate-400 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-white">${product.price.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm">{product.stock} in stock</span>
                  </div>

                  {/* Share feature with DOM XSS hint */}
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-slate-400 text-sm mb-2">Share this product (add #message to URL):</p>
                    {/* VULN: DOM XSS - innerHTML written from URL hash */}
                    <div id="share-message" className="text-slate-300 text-sm min-h-[24px]"></div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-600 rounded-lg overflow-hidden">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">-</button>
                      <span className="px-4 py-2 text-white font-medium border-x border-slate-600">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">+</button>
                    </div>
                    <button
                      onClick={addToCart}
                      id="add-to-cart-detail-btn"
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        added ? 'bg-green-600 text-white' : 'btn-primary'
                      }`}
                    >
                      {added ? '✓ Added to Cart!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <ReviewSection productId={product.id} />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

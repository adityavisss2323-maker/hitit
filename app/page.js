'use client';
// app/page.js - VulnMarket Homepage
// FLAG{html_c0mm3nts_4r3_n0t_s3cr3ts} is in Footer.js HTML comment
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then((r) => r.json())
      .then((data) => {
        setFeaturedProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ⚠️ Educational Warning Banner */}
      <div className="warning-pulse border-2 border-red-600 bg-red-950/40 mx-4 mt-4 rounded-xl p-4">
        <div className="flex items-start gap-3 max-w-7xl mx-auto">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-red-400 font-bold text-sm uppercase tracking-wide">⚠️ Security Training Application</h2>
            <p className="text-red-300 text-sm mt-1">
              <strong>This application is intentionally vulnerable for educational purposes only.</strong>{' '}
              Do not deploy it on the public internet. This app contains deliberate security vulnerabilities
              for CTF practice and cybersecurity training. Use only in isolated lab environments.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">Now with 500+ products</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-white">Shop The </span>
            <span className="gradient-text">Future</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
            Discover premium electronics, cutting-edge gadgets, and the latest tech at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary text-base py-3 px-8" id="hero-shop-btn">
              Shop Now
            </Link>
            <Link href="/search" className="btn-ghost text-base py-3 px-8" id="hero-search-btn">
              Search Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Products', value: '500+' },
            { label: 'Customers', value: '12K+' },
            { label: 'Orders', value: '45K+' },
            { label: 'Rating', value: '4.8★' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-slate-400 mt-1">Top-rated items just for you</p>
            </div>
            <Link href="/products" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Electronics', emoji: '💻', color: 'blue' },
              { name: 'Wearables', emoji: '⌚', color: 'purple' },
              { name: 'Storage', emoji: '💾', color: 'green' },
              { name: 'Accessories', emoji: '🎧', color: 'amber' },
              { name: 'Furniture', emoji: '🪑', color: 'red' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.name}`}
                className="glass-card p-6 text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <div className="text-white font-medium text-sm">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Fast Shipping',
                desc: 'Free delivery on orders over $50. Express options available.',
              },
              {
                icon: '🔒',
                title: 'Secure Payments',
                desc: 'Your payment information is safe with our encrypted checkout.',
              },
              {
                icon: '↩️',
                title: '30-Day Returns',
                desc: 'Not satisfied? Return within 30 days for a full refund.',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

'use client';
// app/orders/[order_id]/page.js
// VULN: IDOR - fetches any order by ID without ownership check
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function OrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    // VULN: IDOR - any authenticated user can access any order by ID
    fetch(`/api/orders/${resolvedParams.order_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load order'); setLoading(false); });
  }, [resolvedParams.order_id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/orders" className="text-slate-400 hover:text-white transition-colors">
              ← Orders
            </Link>
            <span className="text-slate-600">/</span>
            <h1 className="text-3xl font-bold text-white">Order Detail</h1>
          </div>

          {loading ? (
            <div className="glass-card p-8"><div className="skeleton h-32" /></div>
          ) : error ? (
            <div className="glass-card p-8 text-center"><p className="text-red-400">{error}</p></div>
          ) : order ? (
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Order #{order.id}</h2>
                  <p className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full border text-sm font-medium ${statusColors[order.status] || statusColors.pending}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                <img src={order.product?.image} alt={order.product?.name} className="w-20 h-20 object-cover rounded-xl" />
                <div>
                  <h3 className="text-white font-semibold">{order.product?.name}</h3>
                  <p className="text-slate-400 text-sm">Quantity: {order.quantity}</p>
                  <p className="text-slate-400 text-sm">Unit Price: ${order.product?.price?.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID</span>
                  <span className="text-white font-mono">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer ID</span>
                  {/* VULN: Exposes userId - useful for IDOR chaining */}
                  <span className="text-white font-mono" id="order-userid">{order.userId}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-white">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

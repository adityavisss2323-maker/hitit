'use client';
// app/orders/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load orders'); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="glass-card p-6"><div className="skeleton h-16" /></div>)}
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center"><p className="text-red-400">{error}</p></div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400 text-lg mb-4">No orders yet</p>
              <Link href="/products" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="block">
                  <div className="glass-card p-5 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={order.product?.image} alt={order.product?.name} className="w-14 h-14 object-cover rounded-lg" />
                        <div>
                          <p className="text-white font-semibold">{order.product?.name}</p>
                          <p className="text-slate-400 text-sm">Order #{order.id} &bull; Qty: {order.quantity}</p>
                          <p className="text-slate-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">${order.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

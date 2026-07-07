'use client';
// app/checkout/page.js
// VULN: No CSRF protection on order submission
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', card: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      // Place order for each cart item
      const results = await Promise.all(
        cart.map((item) =>
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            // VULN: No CSRF token sent or checked
            body: JSON.stringify({
              productId: item.id,
              quantity: item.quantity,
              total: item.price * item.quantity,
            }),
          })
        )
      );

      const allOk = results.every((r) => r.ok);
      if (allOk) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        setSuccess(true);
      } else {
        setError('Some items could not be processed. Please try again.');
      }
    } catch (err) {
      setError('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
            <p className="text-slate-400 mb-6">Thank you for your purchase. Your order is being processed.</p>
            <button onClick={() => router.push('/orders')} className="btn-primary">View Orders</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="text-white font-bold text-lg mb-5">Shipping &amp; Payment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full Name" className="input-dark" required />
                <input name="address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Shipping Address" className="input-dark" required />
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 text-sm mb-3">Payment Information</p>
                  <input name="card" value={form.card} onChange={(e) => setForm({...form, card: e.target.value})} placeholder="Card Number" className="input-dark mb-3" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="expiry" value={form.expiry} onChange={(e) => setForm({...form, expiry: e.target.value})} placeholder="MM/YY" className="input-dark" required />
                    <input name="cvv" value={form.cvv} onChange={(e) => setForm({...form, cvv: e.target.value})} placeholder="CVV" className="input-dark" required />
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading || cart.length === 0} className="w-full btn-primary py-3 text-base" id="place-order-btn">
                  {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-white font-bold text-lg mb-5">Order Items ({cart.length})</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-4 mt-4 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';
// app/cart/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
              </svg>
              <p className="text-slate-400 text-lg mb-6">Your cart is empty</p>
              <Link href="/products" className="btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="glass-card p-5 flex items-center gap-5">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{item.name}</h3>
                      <p className="text-blue-400 font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-600 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">-</button>
                        <span className="px-3 py-1.5 text-white font-medium border-x border-slate-600">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 p-1.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 h-fit">
                <h2 className="text-white font-bold text-lg mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-400 truncate mr-4">{item.name} x{item.quantity}</span>
                      <span className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-4 flex justify-between mb-6">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
                </div>
                <button onClick={() => router.push('/checkout')} className="w-full btn-primary py-3 text-base" id="proceed-checkout-btn">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

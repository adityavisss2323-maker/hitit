'use client';
// components/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // VULN: JWT decoded client-side to get role, no server-side verification of role
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (e) {
        localStorage.removeItem('token');
      }
    }

    // Cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Vuln</span>
              <span className="text-blue-400">Market</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Products
            </Link>
            <Link
              href="/search"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Search
            </Link>
            {user && (
              <>
                <Link
                  href="/orders"
                  className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Orders
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Profile
                </Link>
              </>
            )}
            {/* VULN: Admin link visible based on client-side JWT role check */}
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              id="navbar-cart-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="badge-admin">Admin</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm"
                  id="navbar-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm" id="navbar-login-btn">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm" id="navbar-register-btn">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700 space-y-2">
            <Link href="/products" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
              Products
            </Link>
            <Link href="/search" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
              Search
            </Link>
            {user && (
              <>
                <Link href="/orders" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                  Orders
                </Link>
                <Link href={`/profile/${user.id}`} className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg">
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

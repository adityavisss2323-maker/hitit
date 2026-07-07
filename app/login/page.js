'use client';
// app/login/page.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.token) {
        // VULN: Token stored in localStorage (not httpOnly cookie)
        localStorage.setItem('token', data.token);
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-slate-400 text-sm mt-1">Sign in to your VulnMarket account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="login-username">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-dark"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-dark"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                  {/* VULN: Error message may leak SQL error details */}
                  <p className="text-red-400 text-sm" id="login-error">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base"
                id="login-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-slate-400 text-sm">
                <a href="/api/auth/reset" className="text-blue-400 hover:underline">Forgot password?</a>
              </p>
              <p className="text-slate-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-400 hover:underline">Register here</Link>
              </p>
            </div>

            {/* VULN: Default credentials hint in UI */}
            <div className="mt-6 border-t border-slate-700 pt-4">
              <p className="text-slate-600 text-xs text-center">Demo: use admin / admin123 for admin access</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

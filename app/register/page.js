'use client';
// app/register/page.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setSuccess('Account created! Redirecting...');
        setTimeout(() => router.push('/'), 1500);
      } else {
        setError(data.error || 'Registration failed');
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-slate-400 text-sm mt-1">Join VulnMarket today</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="reg-username">Username</label>
                <input id="reg-username" name="username" type="text" value={form.username} onChange={handleChange} placeholder="Choose a username" className="input-dark" required />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="reg-email">Email</label>
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input-dark" required />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="reg-password">Password</label>
                <input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" className="input-dark" required />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="reg-confirm">Confirm Password</label>
                <input id="reg-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="input-dark" required />
              </div>

              {error && <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3"><p className="text-red-400 text-sm">{error}</p></div>}
              {success && <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3"><p className="text-green-400 text-sm">{success}</p></div>}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base mt-2" id="register-submit-btn">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

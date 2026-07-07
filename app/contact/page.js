'use client';
// app/contact/page.js
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Support</h1>
          <p className="text-slate-400 mb-8">Have a question or issue? We are here to help.</p>

          {success ? (
            <div className="glass-card p-10 text-center">
              <div className="w-16 h-16 bg-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
              <p className="text-slate-400">Our support team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="contact-name">Your Name</label>
                    <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-dark" required />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="contact-email">Email Address</label>
                    <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input-dark" required />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="contact-subject">Subject</label>
                  <input id="contact-subject" name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="What is your issue about?" className="input-dark" required />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} placeholder="Describe your issue in detail..." rows={6} className="input-dark resize-none" required />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base" id="contact-submit-btn">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: '📧', label: 'Email', value: 'support@vulnmarket.local' },
              { icon: '📞', label: 'Phone', value: '+1 (555) 0100' },
              { icon: '⏰', label: 'Hours', value: 'Mon-Fri 9am-6pm' },
            ].map((item) => (
              <div key={item.label} className="glass-card p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-white text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

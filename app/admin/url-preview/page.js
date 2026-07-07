'use client';
// app/admin/url-preview/page.js
// VULN: SSRF vulnerability
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminUrlPreviewPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') setUnauthorized(true);
    } catch (e) { setUnauthorized(true); }
  }, []);

  const fetchPreview = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/url-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data.content || data.error || 'No content');
    } catch (e) {
      setResult('Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="glass-card p-10 text-center"><p className="text-red-400">Access Denied.</p></div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto flex gap-8">
          <AdminSidebar />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">URL Preview Tool</h1>
            <p className="text-slate-400 mb-8">Fetch and preview content from external URLs.</p>

            <div className="glass-card p-6 mb-6">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input-dark flex-1"
                  id="url-preview-input"
                  onKeyDown={(e) => e.key === 'Enter' && fetchPreview()}
                />
                <button onClick={fetchPreview} disabled={loading} className="btn-primary px-6" id="url-preview-btn">
                  {loading ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
              <p className="text-slate-500 text-xs">
                Fetches content from the provided URL server-side. Useful for previewing external links.
              </p>
            </div>

            {result && (
              <div className="glass-card p-6">
                <h3 className="text-white font-semibold mb-3">Response:</h3>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap break-all max-h-96 overflow-y-auto" id="url-preview-result">{result}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

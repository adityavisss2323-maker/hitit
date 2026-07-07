'use client';
// app/admin/diagnostics/page.js
// VULN: Command injection simulation
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminDiagnosticsPage() {
  const [host, setHost] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') { setUnauthorized(true); }
    } catch (e) { setUnauthorized(true); }
  }, []);

  const runDiagnostic = async () => {
    if (!host.trim()) return;
    setLoading(true);
    setOutput('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // VULN: Unsanitized host sent directly to server command
        body: JSON.stringify({ host }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || 'No output');
    } catch (e) {
      setOutput('Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="glass-card p-10 text-center">
          <p className="text-red-400">Access Denied. Admin role required.</p>
          <p className="text-slate-500 text-sm mt-2">Hint: How is admin checked? Is it server-side?</p>
        </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">System Diagnostics</h1>
            <p className="text-slate-400 mb-8">Network connectivity and DNS lookup tools.</p>

            <div className="glass-card p-6 mb-6">
              <h2 className="text-white font-semibold mb-4">Ping / DNS Lookup</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="Enter hostname or IP (e.g., google.com)"
                  className="input-dark flex-1"
                  id="diagnostic-host-input"
                  onKeyDown={(e) => e.key === 'Enter' && runDiagnostic()}
                />
                <button
                  onClick={runDiagnostic}
                  disabled={loading}
                  className="btn-primary px-6"
                  id="diagnostic-run-btn"
                >
                  {loading ? 'Running...' : 'Run'}
                </button>
              </div>
              {/* VULN: Hint about weak filter */}
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                <p className="text-amber-400 text-xs">
                  ⚠️ Note: Input is sanitized to prevent injection. Semicolons are blocked.
                </p>
              </div>
            </div>

            {output && (
              <div className="terminal-box">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-500 text-xs ml-2">Terminal Output</span>
                </div>
                <pre className="text-green-400 text-sm whitespace-pre-wrap" id="diagnostic-output">{output}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

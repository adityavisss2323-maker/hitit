'use client';
// app/page-view/page.js
// LFI simulation feature
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PageViewPage() {
  const [file, setFile] = useState('about');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedPages = ['about', 'terms', 'privacy', 'faq', 'shipping'];

  const loadPage = async (pageName) => {
    setLoading(true);
    setError('');
    setContent('');
    try {
      const res = await fetch(`/api/page-view?file=${encodeURIComponent(pageName)}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setContent(data.content || '');
    } catch (e) {
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Page Viewer</h1>
          <p className="text-slate-400 mb-8">Browse informational pages about VulnMarket.</p>

          <div className="glass-card p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedPages.map((p) => (
                <button
                  key={p}
                  onClick={() => { setFile(p); loadPage(p); }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors capitalize"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* VULN: Custom file input - LFI vector */}
            <div className="flex gap-3">
              <input
                type="text"
                value={file}
                onChange={(e) => setFile(e.target.value)}
                placeholder="Enter page name (e.g., about)"
                className="input-dark flex-1"
                id="page-view-input"
              />
              <button
                onClick={() => loadPage(file)}
                className="btn-primary px-5"
                id="page-view-load-btn"
              >
                Load
              </button>
            </div>
            {/* Hint about the file parameter */}
            <p className="text-slate-600 text-xs mt-2">
              Tip: Pages are loaded from the server filesystem. Try different page names.
            </p>
          </div>

          {loading && <div className="glass-card p-8"><div className="skeleton h-32" /></div>}
          {error && <div className="glass-card p-5"><p className="text-red-400" id="page-view-error">{error}</p></div>}
          {content && (
            <div className="glass-card p-6">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed" id="page-view-content">{content}</pre>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

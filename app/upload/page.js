'use client';
// app/upload/page.js
// VULN: File upload with client-side only validation
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (e) { router.push('/login'); }
  }, []);

  // VULN: Client-side only file type check
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // VULN: Client-side extension check only - bypassable
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileName = selected.name.toLowerCase();
    const hasAllowedExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasAllowedExt) {
      setError('Only image files are allowed (jpg, jpeg, png, gif, webp)');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">File Upload</h1>
          <p className="text-slate-400 mb-8">Upload your profile picture or other files.</p>

          <div className="glass-card p-8">
            {/* VULN hint in UI */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-6">
              <p className="text-blue-400 text-sm">
                Accepted formats: JPG, PNG, GIF, WebP (max 10MB)
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Note: Validation is performed client-side for performance.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div
                className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-8 text-center transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-400">Click to select a file</p>
                    <p className="text-slate-600 text-sm mt-1">or drag and drop here</p>
                  </div>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && (
                <p className="text-slate-400 text-sm">
                  Selected: <span className="text-white">{file.name}</span> ({(file.size / 1024).toFixed(1)}KB)
                </p>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full btn-primary py-3 text-base"
                id="upload-submit-btn"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>

            {result && (
              <div className="mt-6 bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                <p className="text-green-400 font-medium mb-2">Upload successful!</p>
                {/* VULN: Returns uploaded file URL which may be used for serving malicious content */}
                <p className="text-slate-400 text-sm">File URL:</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 text-sm break-all hover:underline"
                  id="uploaded-file-url"
                >
                  {result.url}
                </a>
                {result.hint && <p className="text-slate-500 text-xs mt-2">{result.hint}</p>}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

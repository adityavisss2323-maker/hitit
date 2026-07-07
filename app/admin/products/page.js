'use client';
// app/admin/products/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') { setUnauthorized(true); setLoading(false); return; }
    } catch (e) { setUnauthorized(true); setLoading(false); return; }
    fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    // VULN: No CSRF protection on product update
    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.product) {
      setProducts(products.map(p => p.id === data.product.id ? data.product : p));
      setMsg('Product updated!');
      setEditingProduct(null);
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(data.error || 'Update failed');
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
            <h1 className="text-3xl font-bold text-white mb-8">Product Manager</h1>
            {msg && <p className="text-green-400 mb-4">{msg}</p>}
            <div className="glass-card overflow-hidden">
              {loading ? <div className="p-8"><div className="skeleton h-48" /></div> : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Action</th></tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="font-mono">{p.id}</td>
                          <td className="text-white font-medium">{p.name}</td>
                          <td>${p.price.toFixed(2)}</td>
                          <td>{p.stock}</td>
                          <td>{p.category}</td>
                          <td>
                            <button
                              onClick={() => { setEditingProduct(p); setForm({ name: p.name, price: p.price, stock: p.stock }); }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Edit modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="glass-card p-6 w-full max-w-md">
                  <h3 className="text-white font-bold text-lg mb-4">Edit Product #{editingProduct.id}</h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" className="input-dark" />
                    <input type="number" value={form.price || ''} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} placeholder="Price" className="input-dark" step="0.01" />
                    <input type="number" value={form.stock || ''} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} placeholder="Stock" className="input-dark" />
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary">Save</button>
                      <button type="button" onClick={() => setEditingProduct(null)} className="btn-ghost">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

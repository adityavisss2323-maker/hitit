'use client';
// app/admin/users/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') { setUnauthorized(true); setLoading(false); return; }
    } catch (e) { setUnauthorized(true); setLoading(false); return; }

    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="glass-card p-10 text-center">
          <p className="text-red-400">Access Denied. Admin role required.</p>
          <p className="text-slate-500 text-sm mt-2">Hint: Check how admin role is verified...</p>
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
            <h1 className="text-3xl font-bold text-white mb-8">User Manager</h1>
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <p className="text-slate-400 text-sm">{users.length} registered users</p>
              </div>
              {loading ? (
                <div className="p-8"><div className="skeleton h-48" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Role</th>
                        <th>Credit Card</th><th>Reset Token</th><th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="font-mono text-slate-400">{u.id}</td>
                          <td className="text-white font-medium">{u.username}</td>
                          <td>{u.email}</td>
                          <td><span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>{u.role}</span></td>
                          {/* VULN: Credit card and reset token exposed in admin panel */}
                          <td className="font-mono text-amber-400 text-xs">{u.creditCard}</td>
                          <td className="font-mono text-xs text-slate-500 max-w-[120px] truncate">{u.resetToken}</td>
                          <td className="text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
// app/admin/page.js
// VULN: Admin check based on client-side JWT role - can be bypassed by forging JWT
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [adminNotes, setAdminNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    // VULN: Role check done client-side by decoding JWT locally
    // An attacker can forge a JWT with role=admin using the weak secret
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
    } catch (e) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([usersData]) => {
      setRecentUsers(usersData.users?.slice(0, 5) || []);
      setStats({
        totalUsers: usersData.users?.length || 0,
        adminUsers: usersData.users?.filter(u => u.role === 'admin').length || 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-card p-10 text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">You need admin privileges to access this area.</p>
            <p className="text-slate-600 text-sm">Hint: JWT tokens contain role information. What if you could change it?</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto flex gap-8">
          <AdminSidebar />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 mt-1">Welcome back, Administrator</p>
              </div>
              <span className="badge-admin text-sm px-3 py-1">Admin Access</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[1,2,3,4].map(i => <div key={i} className="glass-card p-6"><div className="skeleton h-16" /></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'blue' },
                  { label: 'Admin Users', value: stats?.adminUsers || 0, icon: '🔑', color: 'red' },
                  { label: 'API Routes', value: '15+', icon: '🔗', color: 'purple' },
                  { label: 'Flags Hidden', value: '10', icon: '🚩', color: 'amber' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-6">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Admin notes - contain sensitive info */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">📝 Admin Notes</h2>
              <div className="space-y-2">
                {/* VULN: Admin notes contain sensitive info visible to anyone who reaches admin panel */}
                {[
                  'TODO: Change default admin password before production deployment (admin/admin123)',
                  'API key for analytics: vm_analytics_key_8f3a2b1c9d4e5f6g7h8i9j0k',
                  'Remember to disable /api/debug endpoint before going live',
                  'Database backup runs nightly to /api/backup - should add authentication',
                ].map((note, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-300 text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent users */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Recent Users</h2>
                <Link href="/admin/users" className="text-blue-400 text-sm hover:underline">View all</Link>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Username</th><th>Email</th><th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-mono">{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td><span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

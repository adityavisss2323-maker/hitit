'use client';
// app/profile/[id]/page.js
// VULN: IDOR - loads any user profile by ID without ownership check
import { useState, useEffect, use } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ProfilePage({ params }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: '', creditCard: '' });
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${resolvedParams.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('Failed to parse response from server.');
          setLoading(false);
          return;
        }

        if (data?.error) {
          setError(typeof data.error === 'string' ? data.error : 'An error occurred');
        } else if (data?.user) {
          setProfile(data.user);
          setForm({ 
            email: typeof data.user.email === 'string' ? data.user.email : '', 
            creditCard: typeof data.user.creditCard === 'string' ? data.user.creditCard : '' 
          });
        } else {
          setError('Invalid profile data received');
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [resolvedParams.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/profile/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.user) {
        setProfile(data.user);
        setSaveMsg('Profile updated!');
        setEditing(false);
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg(typeof data?.error === 'string' ? data.error : 'Update failed');
      }
    } catch (err) {
      setSaveMsg('Network error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">User Profile</h1>

          {loading ? (
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="skeleton w-20 h-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-4 w-48" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-red-400" id="profile-error">{String(error)}</p>
            </div>
          ) : profile ? (
            <div className="glass-card p-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-3xl font-bold">
                    {typeof profile.username === 'string' ? profile.username[0]?.toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{String(profile.username || 'Unknown')}</h2>
                  <span className={profile.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                    {String(profile.role || 'user')}
                  </span>
                  <p className="text-slate-500 text-sm mt-1">
                    Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {!editing ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-slate-500 text-xs uppercase tracking-wider">Email</label>
                    <p className="text-white mt-1" id="profile-email">{String(profile.email || 'No email')}</p>
                  </div>
                  {profile.creditCard && (
                    <div>
                      <label className="text-slate-500 text-xs uppercase tracking-wider">Payment Method</label>
                      <p className="text-white mt-1 font-mono" id="profile-creditcard">{String(profile.creditCard)}</p>
                    </div>
                  )}
                  {profile.id === 2 && profile.resetToken && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs">Account note: {String(profile.resetToken)}</p>
                    </div>
                  )}
                  {saveMsg && <p className="text-green-400 text-sm">{String(saveMsg)}</p>}
                  <button onClick={() => setEditing(true)} className="btn-primary" id="edit-profile-btn">Edit Profile</button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-dark" id="profile-email-input" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Credit Card</label>
                    <input type="text" value={form.creditCard} onChange={(e) => setForm({...form, creditCard: e.target.value})} className="input-dark" placeholder="xxxx-xxxx-xxxx-xxxx" id="profile-card-input" />
                  </div>
                  {saveMsg && <p className="text-red-400 text-sm">{String(saveMsg)}</p>}
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary" id="save-profile-btn">Save Changes</button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { profileApi, type UserProfile } from '../lib/api';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    profileApi.get().then(p => { setProfile(p); setFullName(p.fullName || ''); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update({ fullName });
      setProfile(updated);
      setMsg('Profile updated');
      setTimeout(() => setMsg(''), 2000);
    } catch {} finally { setSaving(false); }
  };

  if (!profile) return <div className="p-10 text-center text-nv-text-dim">Loading profile...</div>;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Profile</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Manage your account information.</p>
      </div>

      {msg && <div className="mb-4 p-3 bg-nv-tertiary/10 border border-nv-tertiary/20 rounded-xl text-[13px] text-nv-tertiary">{msg}</div>}

      {/* Avatar + name */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-nv-primary-container/15 border border-nv-primary/20 flex items-center justify-center text-nv-primary text-[24px] font-bold">
            {(profile.fullName || profile.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text">{profile.fullName || profile.username}</div>
            <div className="text-[13px] text-nv-text-dim">@{profile.username}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 transition-colors" />
          </div>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Account Details</h3>
        <div className="space-y-3">
          {[
            { label: 'Username', value: profile.username },
            { label: 'Total Scans', value: String(profile.totalScansPerformed || 0) },
            { label: 'Language', value: profile.preferredLanguage || 'English' },
            { label: 'Member Since', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A' },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-nv-outline-variant/10 last:border-0">
              <span className="text-[13px] text-nv-text-dim">{r.label}</span>
              <span className="text-[13px] text-nv-text font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Settings</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Manage your application preferences.</p>
      </div>

      {/* Account */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-6">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-nv-outline-variant/10">
            <div>
              <div className="text-[14px] text-nv-text">Signed in as</div>
              <div className="text-[12px] text-nv-text-dim">@{user?.username}</div>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 text-[13px] text-nv-error hover:bg-nv-error/10 rounded-xl transition-colors">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-6">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Dark Mode', desc: 'Always enabled', enabled: true },
            { label: 'Notifications', desc: 'Analysis completion alerts', enabled: true },
            { label: 'Auto-save Results', desc: 'Save analysis results automatically', enabled: true },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center py-3 border-b border-nv-outline-variant/10 last:border-0">
              <div>
                <div className="text-[14px] text-nv-text">{s.label}</div>
                <div className="text-[12px] text-nv-text-dim">{s.desc}</div>
              </div>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${s.enabled ? 'bg-nv-primary-container' : 'bg-nv-surface-container-high'}`}>
                <div className={`w-5 h-5 rounded-full transition-all ${s.enabled ? 'bg-nv-on-primary-container translate-x-4' : 'bg-nv-text-dim translate-x-0'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-6">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">More</h3>
        <div className="space-y-1">
          {[
            { label: 'Accessibility', path: '/accessibility', icon: 'accessibility_new' },
            { label: 'Privacy Policy', path: '/privacy', icon: 'shield' },
            { label: 'Help & FAQ', path: '/help', icon: 'help' },
          ].map(link => (
            <button key={link.path} onClick={() => navigate(link.path)} className="flex items-center gap-3 w-full py-3 px-2 rounded-xl text-[14px] text-nv-text-muted hover:text-nv-text hover:bg-nv-surface transition-colors text-left">
              <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-error/15">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-error uppercase tracking-wider mb-3">Danger Zone</h3>
        <p className="text-[13px] text-nv-text-dim mb-4">Sign out of your account on this device.</p>
        <button onClick={handleLogout} className="px-5 py-2.5 bg-nv-error/10 hover:bg-nv-error/20 text-nv-error text-[13px] font-medium rounded-xl border border-nv-error/20 transition-all">Sign Out</button>
      </div>
    </div>
  );
}

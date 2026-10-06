import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';

interface ToggleRowProps {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, desc, value, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-nv-outline-variant/10 last:border-0">
      <div className="min-w-0 pr-4">
        <div className="text-[14px] text-nv-text">{label}</div>
        <div className="text-[12px] text-nv-text-dim mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-nv-primary/40 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${value ? 'bg-nv-primary-container' : 'bg-nv-surface-container-high'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ${
          value ? 'translate-x-5 bg-nv-on-primary-container' : 'translate-x-0 bg-nv-text-dim'
        }`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Persistent prefs via localStorage
  const [prefs, setPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nv_prefs') || '{}');
    } catch {
      return {};
    }
  });

  const setPref = (key: string, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    localStorage.setItem('nv_prefs', JSON.stringify(next));
  };

  const getPref = (key: string, def = true): boolean =>
    prefs[key] !== undefined ? prefs[key] : def;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] mb-2">Preferences</div>
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-semibold text-nv-text tracking-tight">Settings</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Manage your application preferences and account.</p>
      </div>

      {/* Account section */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-5">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Account</h3>
        <div className="flex items-center gap-4 p-3 bg-nv-surface rounded-xl border border-nv-outline-variant/15 mb-4">
          <div className="w-12 h-12 rounded-xl bg-nv-primary-container/15 border border-nv-primary/20 flex items-center justify-center text-nv-primary text-[20px] font-bold">
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-nv-text">{user?.fullName || user?.username}</div>
            <div className="text-[13px] text-nv-text-dim">@{user?.username}</div>
          </div>
          <Link
            to="/profile"
            className="ml-auto text-[13px] text-nv-primary hover:underline flex items-center gap-1"
          >
            Edit Profile
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <button
          onClick={() => setConfirmLogout(true)}
          className="flex items-center gap-2 text-[13px] text-nv-text-muted hover:text-nv-error transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">logout</span>
          Sign out of this device
        </button>
      </div>

      {/* Analysis preferences */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-5">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Analysis</h3>
        <div className="space-y-0">
          <ToggleRow
            label="Auto-save Results"
            desc="Automatically save analysis results to your history"
            value={getPref('autoSave')}
            onChange={v => setPref('autoSave', v)}
          />
          <ToggleRow
            label="Allergen Warnings"
            desc="Highlight allergens detected in ingredients"
            value={getPref('allergenWarnings')}
            onChange={v => setPref('allergenWarnings', v)}
          />
          <ToggleRow
            label="Detailed Claim Verification"
            desc="Show extended evidence for each marketing claim"
            value={getPref('detailedClaims', false)}
            onChange={v => setPref('detailedClaims', v)}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-5">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Appearance</h3>
        <ToggleRow
          label="Dark Mode"
          desc="Always enabled — NutriVerify uses a dark premium theme"
          value={true}
          onChange={() => {}}
          disabled
        />
        <ToggleRow
          label="Animated Backgrounds"
          desc="Wave field and particle effects on pages"
          value={getPref('animations')}
          onChange={v => setPref('animations', v)}
        />
        <ToggleRow
          label="Reduced Motion"
          desc="Minimise animations for accessibility"
          value={getPref('reducedMotion', false)}
          onChange={v => setPref('reducedMotion', v)}
        />
      </div>

      {/* Privacy */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-5">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Privacy</h3>
        <ToggleRow
          label="Analysis History"
          desc="Store your analysis history on the server"
          value={getPref('storeHistory')}
          onChange={v => setPref('storeHistory', v)}
        />
        <p className="text-[12px] text-nv-text-dim mt-3">
          NutriVerify does not share your data with third parties. All analysis is performed server-side and stored only in your account.
          <Link to="/privacy" className="text-nv-primary hover:underline ml-1">Read our Privacy Policy</Link>
        </p>
      </div>

      {/* Quick links */}
      <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15 mb-5">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">More</h3>
        <div className="space-y-1">
          {[
            { label: 'Accessibility Settings', path: '/accessibility', icon: 'accessibility_new', desc: 'Focus modes, contrast, motion' },
            { label: 'Privacy Policy', path: '/privacy', icon: 'shield', desc: 'Data handling & your rights' },
            { label: 'Help & FAQ', path: '/help', icon: 'help', desc: 'Common questions answered' },
          ].map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl text-left hover:bg-nv-surface-container-high/60 transition-colors group"
            >
              <span className="material-symbols-outlined text-[18px] text-nv-text-muted group-hover:text-nv-primary transition-colors">{link.icon}</span>
              <div>
                <div className="text-[14px] text-nv-text">{link.label}</div>
                <div className="text-[11px] text-nv-text-dim">{link.desc}</div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-nv-text-dim ml-auto">chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-error/15">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-error uppercase tracking-wider mb-3">Danger Zone</h3>
        <p className="text-[13px] text-nv-text-dim mb-4">Signing out will remove your session from this device. Your data remains intact.</p>
        <button
          onClick={() => setConfirmLogout(true)}
          className="px-5 py-2.5 bg-nv-error/10 hover:bg-nv-error/20 text-nv-error text-[13px] font-medium rounded-xl border border-nv-error/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[17px]">logout</span>
          Sign Out
        </button>
      </div>

      {/* Confirm logout modal */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true">
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/20 w-full max-w-sm shadow-2xl animate-fade-in-scale">
            <div className="w-10 h-10 rounded-full bg-nv-error/10 border border-nv-error/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[20px] text-nv-error">logout</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text mb-2">Sign Out?</h3>
            <p className="text-[14px] text-nv-text-muted mb-6">You'll need to sign in again to access NutriVerify.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2.5 bg-nv-surface-container-high hover:bg-nv-surface-container-highest text-nv-text text-[13px] font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-nv-error/15 hover:bg-nv-error/25 text-nv-error text-[13px] font-semibold rounded-xl border border-nv-error/20 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

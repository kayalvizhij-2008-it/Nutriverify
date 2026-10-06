import { useState, useEffect } from 'react';
import { profileApi, type UserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';

const ALLERGEN_OPTIONS = ['Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soy', 'Sesame'];
const GOAL_OPTIONS = [
  'Weight Management', 'Heart Health', 'Muscle Gain', 'Diabetes Management',
  'Reduce Sodium', 'Low Sugar', 'High Protein', 'Vegan', 'Vegetarian', 'Gluten-Free',
];

function ToggleChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 text-[12px] font-[family-name:var(--font-mono)] rounded-lg border transition-all ${
        active
          ? 'bg-nv-primary-container/20 text-nv-primary border-nv-primary/30'
          : 'bg-nv-surface text-nv-text-muted border-nv-outline-variant/20 hover:border-nv-outline-variant/40 hover:text-nv-text'
      }`}
    >
      {active && <span className="material-symbols-outlined text-[12px] mr-1 align-middle">check</span>}
      {label}
    </button>
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    profileApi.get()
      .then(p => {
        setProfile(p);
        setFullName(p.fullName || '');
        setAllergens(p.allergens || []);
        setGoals(p.dietaryGoals || []);
      })
      .catch(() => {});
  }, []);

  const toggleAllergen = (a: string) =>
    setAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const toggleGoal = (g: string) =>
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update({ fullName, allergens, dietaryGoals: goals });
      setProfile(updated);
      setMsg('Profile updated successfully');
      setMsgType('success');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to save. Please try again.');
      setMsgType('error');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-nv-primary/30 border-t-nv-primary rounded-full animate-spin mb-3" />
        <span className="text-[14px] text-nv-text-dim">Loading profile...</span>
      </div>
    );
  }

  const initials = (profile.fullName || profile.username || 'U').charAt(0).toUpperCase();
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] mb-2">Account</div>
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-semibold text-nv-text tracking-tight">Profile</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Manage your account information and dietary preferences.</p>
      </div>

      {/* Status message */}
      {msg && (
        <div className={`mb-6 p-3 rounded-xl text-[13px] border flex items-center gap-2 ${
          msgType === 'success' ? 'bg-nv-tertiary/10 border-nv-tertiary/20 text-nv-tertiary' : 'bg-nv-error/10 border-nv-error/20 text-nv-error'
        }`}>
          <span className="material-symbols-outlined text-[16px]">{msgType === 'success' ? 'check_circle' : 'error'}</span>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — avatar + identity */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nv-primary-container/25 to-nv-primary-container/5 border border-nv-primary/20 flex items-center justify-center text-nv-primary text-[32px] font-bold font-[family-name:var(--font-display)] mx-auto">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-nv-tertiary rounded-full border-2 border-nv-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-nv-on-tertiary">check</span>
              </div>
            </div>
            <div className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text">{profile.fullName || profile.username}</div>
            <div className="text-[13px] text-nv-text-dim">@{profile.username}</div>
          </div>

          {/* Stats */}
          <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15">
            <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Account Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Member Since', value: memberSince, icon: 'calendar_today' },
                { label: 'Total Scans', value: String(profile.totalScansPerformed || 0), icon: 'document_scanner' },
                { label: 'Language', value: profile.preferredLanguage || 'English', icon: 'translate' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-nv-outline-variant/10 last:border-0">
                  <div className="flex items-center gap-2 text-[13px] text-nv-text-dim">
                    <span className="material-symbols-outlined text-[15px]">{r.icon}</span>
                    {r.label}
                  </div>
                  <span className="text-[13px] text-nv-text font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — editable fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identity */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-5">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5" htmlFor="full-name">
                  Full Name
                </label>
                <input
                  id="full-name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 focus:ring-1 focus:ring-nv-primary/10 transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="w-full bg-nv-surface/50 border border-nv-outline-variant/10 rounded-xl px-4 py-2.5 text-[14px] text-nv-text-muted cursor-not-allowed">
                  @{profile.username}
                </div>
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">Allergen Preferences</h3>
              {allergens.length > 0 && (
                <span className="text-[10px] font-[family-name:var(--font-mono)] bg-nv-error/10 text-nv-error border border-nv-error/20 px-2 py-0.5 rounded-full">
                  {allergens.length} selected
                </span>
              )}
            </div>
            <p className="text-[12px] text-nv-text-dim mb-4">We'll highlight these allergens in analysis results.</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(a => (
                <ToggleChip key={a} label={a} active={allergens.includes(a)} onToggle={() => toggleAllergen(a)} />
              ))}
            </div>
          </div>

          {/* Dietary Goals */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">Dietary Goals</h3>
              {goals.length > 0 && (
                <span className="text-[10px] font-[family-name:var(--font-mono)] bg-nv-primary/10 text-nv-primary border border-nv-primary/20 px-2 py-0.5 rounded-full">
                  {goals.length} active
                </span>
              )}
            </div>
            <p className="text-[12px] text-nv-text-dim mb-4">Your goals influence recommendation priorities in analysis.</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map(g => (
                <ToggleChip key={g} label={g} active={goals.includes(g)} onToggle={() => toggleGoal(g)} />
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[15px] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-nv-on-primary-container/30 border-t-nv-on-primary-container rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

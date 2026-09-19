import { useState, useEffect } from 'react';
import { profileApi } from '../lib/api';

const GOALS = [
  { id: 'low-sugar', icon: 'bloodtype', title: 'Low Sugar', desc: 'Reduce daily sugar intake' },
  { id: 'low-sodium', icon: 'water_drop', title: 'Low Sodium', desc: 'Limit sodium consumption' },
  { id: 'high-protein', icon: 'fitness_center', title: 'High Protein', desc: 'Increase protein intake' },
  { id: 'high-fiber', icon: 'grass', title: 'High Fiber', desc: 'Boost dietary fiber' },
  { id: 'low-fat', icon: 'opacity', title: 'Low Fat', desc: 'Reduce fat consumption' },
  { id: 'vegetarian', icon: 'eco', title: 'Vegetarian', desc: 'Plant-based preferences' },
  { id: 'vegan', icon: 'spa', title: 'Vegan', desc: 'No animal products' },
  { id: 'low-calorie', icon: 'local_fire_department', title: 'Low Calorie', desc: 'Calorie-conscious eating' },
];

export default function Goals() {
  const [active, setActive] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    profileApi.getGoals().then(g => setActive(g.dietaryGoals || [])).catch(() => {});
  }, []);

  const toggle = (id: string) => {
    setActive(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const save = async () => {
    setSaving(true);
    try { await profileApi.updateGoals({ dietaryGoals: active }); setMsg('Goals updated'); setTimeout(() => setMsg(''), 2000); }
    catch {} finally { setSaving(false); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Dietary Goals</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Set your dietary preferences for personalized recommendations.</p>
      </div>

      {msg && <div className="mb-4 p-3 bg-nv-tertiary/10 border border-nv-tertiary/20 rounded-xl text-[13px] text-nv-tertiary">{msg}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {GOALS.map(g => (
          <button key={g.id} onClick={() => toggle(g.id)}
            className={`p-4 rounded-xl border text-left transition-all ${active.includes(g.id) ? 'bg-nv-primary-container/15 border-nv-primary/25' : 'bg-nv-surface-container border-nv-outline-variant/15 hover:border-nv-outline-variant/25'}`}>
            <span className={`material-symbols-outlined text-[22px] block mb-2 ${active.includes(g.id) ? 'text-nv-primary' : 'text-nv-text-dim'}`}>{g.icon}</span>
            <div className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-nv-text">{g.title}</div>
            <div className="text-[12px] text-nv-text-dim mt-0.5">{g.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Goals'}
      </button>
    </div>
  );
}

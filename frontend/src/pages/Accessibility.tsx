import { useState } from 'react';

const SETTINGS = [
  { id: 'high-contrast', title: 'High Contrast', desc: 'Increase color contrast for better readability', enabled: false },
  { id: 'large-text', title: 'Larger Text', desc: 'Increase base font size across the application', enabled: false },
  { id: 'reduced-motion', title: 'Reduced Motion', desc: 'Minimize animations and transitions', enabled: false },
  { id: 'keyboard-nav', title: 'Enhanced Keyboard Navigation', desc: 'Show focus indicators on all interactive elements', enabled: false },
  { id: 'simplified-ui', title: 'Simplified Interface', desc: 'Reduce visual complexity and decorative elements', enabled: false },
];

export default function Accessibility() {
  const [settings, setSettings] = useState(SETTINGS);

  const toggle = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const applySetting = (id: string, enabled: boolean) => {
    const root = document.documentElement;
    switch (id) {
      case 'high-contrast':
        root.style.setProperty('--color-nv-text', enabled ? '#ffffff' : '');
        root.style.setProperty('--color-nv-text-muted', enabled ? '#d0c5af' : '');
        break;
      case 'large-text':
        root.style.fontSize = enabled ? '18px' : '';
        break;
      case 'reduced-motion':
        root.classList.toggle('reduce-motion', enabled);
        break;
      case 'keyboard-nav':
        root.classList.toggle('keyboard-nav', enabled);
        break;
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Accessibility</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Customize your viewing experience.</p>
      </div>

      <div className="space-y-3">
        {settings.map(s => (
          <div key={s.id} className="bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15 flex items-center justify-between">
            <div>
              <div className="text-[14px] text-nv-text font-medium">{s.title}</div>
              <div className="text-[12px] text-nv-text-dim mt-0.5">{s.desc}</div>
            </div>
            <button onClick={() => { toggle(s.id); applySetting(s.id, !s.enabled); }}
              className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ml-4 ${s.enabled ? 'bg-nv-primary-container' : 'bg-nv-surface-container-high'}`}>
              <div className={`w-5 h-5 rounded-full transition-all ${s.enabled ? 'bg-nv-on-primary-container translate-x-4' : 'bg-nv-text-dim translate-x-0'}`}></div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
        <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {[
            { key: 'Tab', action: 'Move between elements' },
            { key: 'Enter', action: 'Activate buttons and links' },
            { key: 'Esc', action: 'Close dialogs and menus' },
            { key: 'Space', action: 'Toggle checkboxes and buttons' },
          ].map(s => (
            <div key={s.key} className="flex items-center gap-3 py-2 border-b border-nv-outline-variant/10 last:border-0">
              <kbd className="px-2 py-1 bg-nv-surface text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim rounded border border-nv-outline-variant/20">{s.key}</kbd>
              <span className="text-[13px] text-nv-text-muted">{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

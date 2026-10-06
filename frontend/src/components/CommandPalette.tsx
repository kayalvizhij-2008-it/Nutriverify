import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDemoAnalysis } from '../lib/demo';

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'SAMPLE PRODUCT' | 'REGULATORY AUDIT' | 'ASSISTANT' | 'SYSTEM' | 'USER PREFERENCES' | 'ABOUT & STANDARDS';
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  badge?: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Open via custom event if triggered from top bar
  useEffect(() => {
    const handleOpenCommand = () => setOpen(true);
    window.addEventListener('nv_open_command_palette', handleOpenCommand);
    return () => window.removeEventListener('nv_open_command_palette', handleOpenCommand);
  }, []);

  const runItem = useCallback((item: CommandItem) => {
    setOpen(false);
    setQuery('');
    item.action();
  }, []);

  const items: CommandItem[] = [
    {
      id: 'nav-analyze',
      category: 'NAVIGATION',
      title: 'Analyze Product Hub',
      subtitle: 'Choose between camera scanner, packaging upload, or manual entry',
      icon: 'qr_code_scanner',
      action: () => navigate('/analyze'),
    },
    {
      id: 'nav-scan',
      category: 'NAVIGATION',
      title: 'Camera Scan',
      subtitle: 'Launch live optical character recognition scanner',
      icon: 'photo_camera',
      badge: 'LIVE OCR',
      action: () => navigate('/camera-scan'),
    },
    {
      id: 'nav-upload',
      category: 'NAVIGATION',
      title: 'Upload Label Image',
      subtitle: 'Upload high-resolution packaging image for label extraction',
      icon: 'cloud_upload',
      action: () => navigate('/upload'),
    },
    {
      id: 'nav-manual',
      category: 'NAVIGATION',
      title: 'Manual Entry Form Sandbox',
      subtitle: 'Input custom macronutrients and ingredient E-numbers',
      icon: 'edit_note',
      action: () => navigate('/manual'),
    },
    {
      id: 'nav-results',
      category: 'NAVIGATION',
      title: 'Latest Verification Results',
      subtitle: 'View detailed dossier, health score, and evidence trail',
      icon: 'fact_check',
      action: () => navigate('/results'),
    },
    {
      id: 'nav-saathi',
      category: 'ASSISTANT',
      title: 'NutriVerify AI Assistant',
      subtitle: 'Ask real-time clinical diet and food safety questions',
      icon: 'smart_toy',
      badge: 'AI ACTIVE',
      action: () => navigate('/nutrisaathi'),
    },
    {
      id: 'nav-voice',
      category: 'ASSISTANT',
      title: 'NutriVerify Voice Assistant',
      subtitle: 'Hands-free voice nutrition intelligence via Web Speech API',
      icon: 'mic',
      badge: 'VOICE',
      action: () => navigate('/voice'),
    },
    {
      id: 'nav-ai-status',
      category: 'SYSTEM',
      title: 'AI & Subsystems Status Center',
      subtitle: 'Real-time health monitor for AI Provider, OCR, and Voice',
      icon: 'monitor_heart',
      action: () => navigate('/ai-status'),
    },
    {
      id: 'nav-compare',
      category: 'NAVIGATION',
      title: 'Product Comparison Matrix',
      subtitle: 'Side-by-side macro & additive comparison',
      icon: 'compare_arrows',
      action: () => navigate('/compare'),
    },
    {
      id: 'nav-history',
      category: 'NAVIGATION',
      title: 'Scan History',
      subtitle: 'Browse all previously analyzed product dossiers',
      icon: 'history',
      action: () => navigate('/history'),
    },
    {
      id: 'nav-saved',
      category: 'NAVIGATION',
      title: 'Saved Products',
      subtitle: 'View bookmarks and favorite food items',
      icon: 'bookmark',
      action: () => navigate('/saved'),
    },
    {
      id: 'nav-reports',
      category: 'NAVIGATION',
      title: 'Audit Safety Reports',
      subtitle: 'Generate & export PDF verification dossiers',
      icon: 'description',
      action: () => navigate('/reports'),
    },
    {
      id: 'nav-goals',
      category: 'USER PREFERENCES',
      title: 'Dietary Goals & Profile',
      subtitle: 'Personalize daily sugar, sodium, and protein thresholds',
      icon: 'track_changes',
      action: () => navigate('/goals'),
    },
    {
      id: 'nav-settings',
      category: 'USER PREFERENCES',
      title: 'Settings & Preferences',
      subtitle: 'Display settings, dark mode, language, and motion controls',
      icon: 'settings',
      action: () => navigate('/settings'),
    },
    {
      id: 'nav-about',
      category: 'ABOUT & STANDARDS',
      title: 'About NutriVerify & Standards',
      subtitle: 'FDA 21 CFR, EFSA, and FSSAI statutory compliance guide',
      icon: 'verified_user',
      action: () => navigate('/about'),
    },
    {
      id: 'demo-granola',
      category: 'SAMPLE PRODUCT',
      title: 'Artisanal Oat-Crust Granola',
      subtitle: 'Score 87/100 · Clean Profile · Pea Protein & Monk Fruit',
      icon: 'nutrition',
      action: () => {
        const specimen = getDemoAnalysis(0);
        sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
        navigate('/results');
      },
    },
    {
      id: 'demo-noodles',
      category: 'SAMPLE PRODUCT',
      title: 'Instant Masala Noodles',
      subtitle: 'Score 34/100 · High Sodium & MSG Flagged',
      icon: 'warning',
      action: () => {
        const specimen = getDemoAnalysis(1);
        sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
        navigate('/results');
      },
    },
    {
      id: 'demo-juice',
      category: 'SAMPLE PRODUCT',
      title: 'Pure Cold-Pressed Orange Juice',
      subtitle: 'Score 91/100 · 100% Pure Squeezed · Zero Added Sugar',
      icon: 'eco',
      action: () => {
        const specimen = getDemoAnalysis(2);
        sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
        navigate('/results');
      },
    },
    {
      id: 'reg-fda',
      category: 'REGULATORY AUDIT',
      title: 'FDA 21 CFR § 101 Food Labeling Standards',
      subtitle: 'Review dual-column nutrition facts & allergen mandates',
      icon: 'gavel',
      action: () => navigate('/claims'),
    },
  ];

  const filtered = items.filter(
    item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      runItem(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div
        className="w-full max-w-2xl bg-[#0B120D] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#101A13]/90">
          <span className="material-symbols-outlined text-primary-container text-[22px] mr-3">search</span>
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search NutriVerify (e.g., 'Granola', 'FDA', 'AI Assistant', 'Camera')..."
            className="flex-1 bg-transparent text-white font-body-md placeholder-[#A9B4AA] focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-code text-[11px] border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5 scroll-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] mb-2 text-outline">search_off</span>
              <p className="font-body-md">No matching NutriVerify records found</p>
              <p className="font-label-code text-body-sm text-outline mt-1">Try searching for 'Scan', 'Granola', or 'FDA'</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => runItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected ? 'bg-primary-container/15 text-white border border-primary-container/30' : 'hover:bg-white/[0.04] text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-container text-black' : 'bg-surface-container-high text-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-body-md font-bold text-white truncate">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-primary-container/20 text-primary-container font-label-code text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{item.subtitle}</span>
                    </div>
                  </div>
                  <span className="font-label-code text-[10px] text-outline uppercase tracking-wider shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#071009] border-t border-white/5 flex items-center justify-between font-label-code text-[11px] text-outline">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>NutriVerify Intelligence v2.6</span>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useState, useEffect } from 'react';
import { healthApi } from '../lib/api';
import AmbientBackground from './AmbientBackground';
import CommandPalette from './CommandPalette';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'ANALYZE',
    items: [
      { path: '/analyze', icon: 'document_scanner', label: 'Analyze Hub' },
      { path: '/camera-scan', icon: 'photo_camera', label: 'Camera Scan' },
      { path: '/upload', icon: 'cloud_upload', label: 'Upload Label' },
      { path: '/manual', icon: 'edit_note', label: 'Manual Entry' },
    ],
  },
  {
    groupTitle: 'INTELLIGENCE',
    items: [
      { path: '/results', icon: 'insights', label: 'Results & Score' },
      { path: '/nutrition', icon: 'pie_chart', label: 'Nutrition & Macros' },
      { path: '/ingredients', icon: 'biotech', label: 'Ingredients DB' },
      { path: '/allergens', icon: 'warning', label: 'Allergens Matrix' },
      { path: '/claims', icon: 'gavel', label: 'Claim Audit' },
      { path: '/compare', icon: 'compare_arrows', label: 'Compare Products' },
    ],
  },
  {
    groupTitle: 'MY NUTRIVERIFY',
    items: [
      { path: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
      { path: '/history', icon: 'history', label: 'Scan History' },
      { path: '/saved', icon: 'bookmark', label: 'Saved Pantry' },
      { path: '/reports', icon: 'description', label: 'Audit Reports' },
    ],
  },
  {
    groupTitle: 'ASSISTANT',
    items: [
      { path: '/nutrisaathi', icon: 'smart_toy', label: 'NutriVerify AI' },
      { path: '/about', icon: 'verified_user', label: 'Standards & About' },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    healthApi.check().catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const currentNavContext = (() => {
    for (const group of NAV_GROUPS) {
      const found = group.items.find((item) => item.path === location.pathname);
      if (found) return { group: group.groupTitle, item: found.label };
    }
    return { group: 'INTELLIGENCE', item: 'System View' };
  })();

  const bgVariant = (() => {
    const p = location.pathname;
    if (p.includes('allergen')) return 'allergen';
    if (p.includes('claim')) return 'claims';
    if (p.includes('ingredient')) return 'nutrition';
    if (p.includes('nutrition')) return 'nutrition';
    if (p.includes('dashboard')) return 'dashboard';
    if (p.includes('nutrisaathi') || p.includes('chat')) return 'assistant';
    if (p.includes('results')) return 'results';
    if (p.includes('analyze') || p.includes('camera') || p.includes('upload') || p.includes('manual')) return 'analysis';
    if (p.includes('login') || p.includes('register')) return 'auth';
    return 'home';
  })();

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('nv_open_command_palette'));
  };

  return (
    <div className="flex h-screen bg-[#071009] text-[#F4F7F2] overflow-hidden font-sans antialiased relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette />

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[250px] bg-[#0B120D] flex flex-col border-r border-white/5 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container text-black flex items-center justify-center shadow-[0_0_15px_rgba(200,255,77,0.35)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <span className="text-base tracking-tight text-white font-bold">
              Nutri<span className="text-primary-container">Verify</span>
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-[#141F17] text-[#8BE28B] font-label-code text-[10px] font-bold border border-white/5">
            v2.6
          </span>
        </div>

        {/* Clean Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scroll-thin">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-3 text-[10px] font-bold font-label-code text-[#6F7A70] uppercase tracking-wider">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                        active
                          ? 'bg-[#142318] text-white shadow-sm font-semibold'
                          : 'text-[#A9B4AA] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary-container shadow-[0_0_8px_#C8FF4D]" />
                      )}

                      <span
                        className={`material-symbols-outlined text-[19px] transition-colors ${
                          active
                            ? 'text-primary-container'
                            : 'text-[#6F7A70] group-hover:text-[#A9B4AA]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Engine Status */}
        <div className="p-3 border-t border-white/5 bg-[#0B120D] flex flex-col gap-2 shrink-0">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-black flex items-center justify-center font-bold text-xs shrink-0">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'K'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">
                {user?.fullName || user?.username || 'Kayalvizhi M.'}
              </span>
              <span className="font-label-code text-[10px] text-[#8BE28B]">Verified Analyst</span>
            </div>
          </Link>

          <div className="flex items-center justify-between text-[11px] font-label-code text-[#6F7A70] px-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BE28B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8BE28B]"></span>
              </span>
              <span className="text-[#8BE28B] text-[10px]">Engine Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#6F7A70] hover:text-[#FF5252] transition-colors flex items-center gap-0.5 text-[11px]"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Minimal Top Header Bar */}
        <header className="h-16 bg-[#0B120D]/90 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-6 shrink-0">
          {/* Left: Mobile hamburger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#A9B4AA] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            <div className="flex items-center gap-2 font-label-code text-xs text-[#6F7A70]">
              <span className="text-primary-container font-semibold">NutriVerify</span>
              <span>/</span>
              <span className="text-[#A9B4AA]">{currentNavContext.group}</span>
              <span>/</span>
              <span className="text-white font-medium">{currentNavContext.item}</span>
            </div>
          </div>

          {/* Center Search Trigger (Desktop) */}
          <button
            onClick={openCommandPalette}
            className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#101A13] border border-white/10 text-xs text-[#A9B4AA] font-label-code hover:border-white/25 transition-all group"
          >
            <span className="material-symbols-outlined text-[16px] text-primary-container group-hover:scale-110 transition-transform">search</span>
            <span>Search NutriVerify database...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-mono border border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/camera-scan"
              className="h-10 px-4 rounded-xl bg-primary-container text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(200,255,77,0.3)] hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
              <span>Analyze Product</span>
            </Link>

            <Link
              to="/nutrisaathi"
              className="hidden sm:inline-flex h-10 px-3.5 rounded-xl bg-[#101A13] hover:bg-[#141F17] text-[#8BE28B] border border-white/10 text-xs font-semibold items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>NutriVerify AI</span>
            </Link>

            <Link
              to="/dashboard"
              className="h-10 px-3 rounded-xl bg-[#101A13] hover:bg-[#141F17] text-white border border-white/10 flex items-center gap-2 transition-all"
              title="Profile & Dashboard"
            >
              <div className="w-6 h-6 rounded-full bg-primary-container text-black flex items-center justify-center font-bold text-[10px]">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'K'}
              </div>
              <span className="hidden md:inline text-xs font-medium text-[#A9B4AA]">
                {user?.fullName?.split(' ')[0] || user?.username || 'Kayalvizhi'}
              </span>
            </Link>
          </div>
        </header>

        {/* Content area with Multi-Layer Ambient Background */}
        <main className="flex-1 overflow-y-auto bg-transparent relative flex flex-col">
          <AmbientBackground variant={bgVariant} intensity="high" />

          <div className="relative z-10 flex-1 flex flex-col pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

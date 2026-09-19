import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useState, useEffect } from 'react';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
  { path: '/analyze', icon: 'document_scanner', label: 'Analyze' },
  { path: '/analyze/manual', icon: 'edit_note', label: '  Manual Entry' },
  { path: '/analyze/upload', icon: 'cloud_upload', label: '  Upload Image' },
  { path: '/analyze/live', icon: 'photo_camera', label: '  Live Camera' },
  { path: '/compare', icon: 'compare_arrows', label: 'Comparison' },
  { path: '/history', icon: 'query_stats', label: 'History', separator: true },
  { path: '/chat', icon: 'smart_toy', label: 'AI Assistant' },
  { path: '/reports', icon: 'description', label: 'Reports' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    fetch('/api/v1/health').then(r => r.ok ? setApiConnected(true) : null).catch(() => {});
  }, []);

  if (!isAuthenticated) return <>{children}</>;

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname)?.label || '';

  return (
    <div className="flex h-screen bg-nv-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-nv-surface-container-lowest flex flex-col border-r border-nv-outline-variant/15 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-nv-outline-variant/15">
          <div className="w-8 h-8 rounded-lg bg-nv-primary-container/15 border border-nv-primary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-nv-primary">verified</span>
          </div>
          <span className="font-[family-name:var(--font-display)] text-[16px] text-nv-text font-semibold tracking-tight">NutriVerify</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <div key={item.path}>
              {item.separator && <div className="my-2 border-t border-nv-outline-variant/15" />}
              <Link
                to={item.path}
                onClick={() => setSidebarOpen(false)}                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-[family-name:var(--font-body)] transition-all ${
                    (location.pathname === item.path || (item.path !== '/analyze' && location.pathname.startsWith(item.path)))
                      ? 'bg-nv-primary-container/15 text-nv-primary font-medium'
                      : 'text-nv-text-muted hover:bg-nv-surface-container-high/50 hover:text-nv-text'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Status footer */}
        <div className="px-4 py-3 border-t border-nv-outline-variant/15">
          <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim">
            <span className={`h-1.5 w-1.5 rounded-full ${apiConnected ? 'bg-nv-tertiary' : 'bg-nv-error'}`}></span>
            <span>{apiConnected ? 'Engine Online' : 'Offline'}</span>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-nv-surface-container-lowest/80 backdrop-blur-xl border-b border-nv-outline-variant/15 z-40 flex items-center justify-between px-6">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-nv-text-muted hover:text-nv-text rounded-lg hover:bg-nv-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            {currentPage && (
              <div className="flex items-center gap-1.5 text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim">
                <span className="text-nv-primary">NutriVerify</span>
                <span className="text-nv-outline-variant">/</span>
                <span>{currentPage}</span>
              </div>
            )}
          </div>

          {/* Right: user */}
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-nv-text-dim hover:text-nv-text rounded-lg hover:bg-nv-surface-container-high transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </button>
            <div className="h-5 w-px bg-nv-outline-variant/20"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-nv-primary-container/15 border border-nv-primary/20 flex items-center justify-center text-nv-primary text-[12px] font-bold">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block text-[13px] font-[family-name:var(--font-body)] text-nv-text-muted">{user?.fullName || user?.username}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-nv-text-dim hover:text-nv-error rounded-lg hover:bg-nv-surface-container-high transition-colors" title="Logout">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-nv-surface">
          {children}
        </main>
      </div>
    </div>
  );
}

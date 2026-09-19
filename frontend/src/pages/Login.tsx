import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nv-surface flex items-center justify-center px-6">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[150px] opacity-30" style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.08), transparent)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-nv-text-dim hover:text-nv-text mb-8 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to home
        </Link>

        {/* Card */}
        <div className="bg-nv-surface-container rounded-2xl p-8 border border-nv-outline-variant/15">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-nv-primary-container/15 border border-nv-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-nv-primary">verified</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text">NutriVerify</span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold text-nv-text mb-1">Welcome back</h1>
          <p className="text-[14px] text-nv-text-muted mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-nv-surface border border-nv-outline-variant/25 rounded-xl px-4 py-3 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 focus:ring-1 focus:ring-nv-primary/20 transition-all"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-nv-surface border border-nv-outline-variant/25 rounded-xl px-4 py-3 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 focus:ring-1 focus:ring-nv-primary/20 transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[15px] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] text-nv-text-dim mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-nv-primary hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

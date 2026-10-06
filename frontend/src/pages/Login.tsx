import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import AmbientBackground from '../components/AmbientBackground';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your email or username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState('');

  const handleGoogleSSO = async () => {
    setGoogleLoading(true);
    setGoogleNotice('');
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
      // Production Google OAuth2 Redirect Flow
      const redirectUri = encodeURIComponent(window.location.origin + '/login');
      const scope = encodeURIComponent('openid email profile');
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
      window.location.href = googleAuthUrl;
      return;
    }

    // Interactive Demo / Sandbox Flow with feedback
    try {
      await new Promise(r => setTimeout(r, 600));
      await login('demouser', 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setGoogleNotice('Google authentication failed. Please use email credentials or check server connectivity.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071009] text-[#dde5d9] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Ambient Atmosphere */}
      <AmbientBackground variant="auth" intensity="high" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Brand Visual & Feature Highlights Matching Image 2 */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Brand Header */}
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-[#C8FF4D] text-black flex items-center justify-center shadow-[0_0_15px_rgba(200,255,77,0.4)]">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Nutri<span className="text-[#C8FF4D]">Verify</span>
            </span>
          </Link>

          {/* Subtitle & Headline */}
          <div>
            <span className="font-label-code text-xs text-[#8BE28B] font-bold uppercase tracking-wider block mb-2">
              SMARTER FOOD CHOICES • SAFER YOU
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.12]">
              Verify Food.<br />
              <span className="text-[#C8FF4D]">Protect Your Health.</span>
            </h1>
            <p className="text-sm text-[#A9B4AA] mt-3 max-w-md leading-relaxed">
              AI-powered analysis to detect harmful ingredients, check allergens, and verify nutrition claims — for a healthier tomorrow.
            </p>
          </div>

          {/* 2-Column Feature Pills Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">search</span>
              <span>Ingredient Analysis</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">bar_chart</span>
              <span>Nutrition Insights</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">shield</span>
              <span>Allergen Detection</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">compare_arrows</span>
              <span>Compare Products</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">verified</span>
              <span>Claim Verification</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D1811]/90 border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">verified_user</span>
              <span>Trusted &amp; Accurate</span>
            </div>
          </div>

          {/* Phone Simulation Card with Scan Complete */}
          <div className="relative w-full max-w-md rounded-2xl bg-[#0B150E] border border-[#8BE28B]/30 p-4 shadow-xl flex items-center gap-4 overflow-hidden">
            {/* Mockup Jar Box */}
            <div className="w-24 h-28 rounded-xl bg-[#102014] border border-white/10 flex flex-col items-center justify-center p-2 shrink-0 text-center relative">
              <span className="text-[9px] uppercase font-bold text-[#8BE28B]">Organic</span>
              <span className="text-[11px] font-black text-white leading-tight">PROTEIN</span>
              <span className="text-[8px] text-[#A9B4AA]">Plant Based</span>
            </div>

            {/* Checklist & Score */}
            <div className="flex-1 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8BE28B]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Scan Complete</span>
                </span>
                <span className="text-xs font-bold text-[#C8FF4D]">98% Overall</span>
              </div>

              <div className="space-y-1 text-[10px] text-[#A9B4AA]">
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-[#8BE28B]">✓</span>
                  <span>Safe &amp; Natural</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-[#8BE28B]">✓</span>
                  <span>No Known Allergens</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-[#8BE28B]">✓</span>
                  <span>High Protein</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-[#8BE28B]">✓</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cursive Signature */}
          <div className="font-['Caveat',cursive] text-2xl text-[#8BE28B]">
            Better Food. Healthier Tomorrow.
          </div>
        </div>

        {/* Right Side: Auth Form Glass Card Matching Image 2 */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center">
          <div className="w-full max-w-[460px] rounded-3xl bg-[#0B150E]/95 border border-[#8BE28B]/30 p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            {/* Logo in Form */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C8FF4D] text-black flex items-center justify-center shadow-[0_0_15px_rgba(200,255,77,0.4)] mb-3">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Nutri<span className="text-[#C8FF4D]">Verify</span></h2>
              <h3 className="text-lg font-bold text-white mt-1">Welcome Back</h3>
              <p className="text-xs text-[#A9B4AA] mt-0.5">
                Login to your account to continue your journey towards a healthier you.
              </p>
            </div>

            {/* Tab Pill Switcher [ Login ] [ Register ] */}
            <div className="flex rounded-full bg-[#060D08] p-1 border border-white/10 mb-6">
              <Link
                to="/login"
                className="flex-1 py-2 rounded-full bg-[#C8FF4D] text-black font-extrabold text-xs text-center shadow-md transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 py-2 rounded-full text-[#A9B4AA] hover:text-white font-semibold text-xs text-center transition-all"
              >
                Register
              </Link>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/40 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Address */}
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A9B4AA]">
                    mail
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[#101D13] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#6F7A70] focus:outline-none focus:border-[#C8FF4D] transition-colors"
                    placeholder="Email Address"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A9B4AA]">
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#101D13] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-[#6F7A70] focus:outline-none focus:border-[#C8FF4D] transition-colors"
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9B4AA] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#A9B4AA] hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-[#101D13] border-white/20 text-[#C8FF4D] focus:ring-0 w-4 h-4 accent-[#C8FF4D]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to demo user.')}
                  className="text-[#8BE28B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-sm rounded-full transition-all shadow-[0_0_20px_rgba(200,255,77,0.35)] flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>➔ Login</span>
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-white/10 flex-1" />
              <span className="font-label-code text-[11px] text-[#A9B4AA] uppercase font-bold">OR</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Google SSO Button */}
            <button
              onClick={handleGoogleSSO}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 rounded-full bg-[#101D13] hover:bg-[#16271a] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-sm active:scale-98 disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#8BE28B]/30 border-t-[#8BE28B] rounded-full animate-spin" />
                  <span className="text-[#8BE28B]">Connecting to Google…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {googleNotice && (
              <p className="mt-2 text-[11px] text-[#FFB86B] text-center">{googleNotice}</p>
            )}

            {/* Footer Link */}
            <div className="mt-6 text-center text-xs text-[#A9B4AA]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#8BE28B] hover:underline font-bold">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


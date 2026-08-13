import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.auth.login(userId, password);
      if (data.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; background: #F7F8FA; min-height: 100vh; display: flex; font-family: 'Inter', sans-serif; }
        .login-layout { display: grid; grid-template-columns: 56fr 44fr; width: 100%; min-height: 100vh; }
        .login-hero {
          background: radial-gradient(circle at 15% 15%, rgba(40,93,150,0.35), transparent 35%),
                      linear-gradient(135deg, #061426 0%, #0A2340 50%, #071A33 100%);
          position: relative; overflow: hidden; display: flex; flex-direction: column;
        }
        .hero-decoration {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px; opacity: 0.06;
        }
        .hero-glow { position: absolute; bottom: -20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%); border-radius: 50%; pointer-events: none; }
        .hero-internal { position: relative; z-index: 10; width: 100%; max-width: 720px; margin: 0 auto; padding: 56px 64px; box-sizing: border-box; display: flex; flex-direction: column; flex: 1; }
        .hero-content { margin: auto 0; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .hero-heading { font-size: clamp(48px, 5vw, 64px); font-weight: 800; line-height: 1.05; letter-spacing: -1.5px; color: #F8FAFC; margin: 0 0 20px; }
        .hero-desc { font-size: 18px; line-height: 1.6; color: rgba(226,232,240,0.78); max-width: 540px; margin: 0; }
        .logo-panel { background: #fff; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; padding: 18px 24px; }
        .logo-panel img { width: 115px; height: auto; display: block; }
        .login-panel { background: #F7F8FA; display: flex; align-items: center; justify-content: center; }
        .login-content { width: min(calc(100% - 64px), 440px); margin: 0 auto; box-sizing: border-box; }
        .login-heading { font-size: 40px; font-weight: 750; line-height: 1.1; color: #071A33; margin: 0 0 10px; letter-spacing: -0.5px; }
        .login-subtitle { font-size: 16px; line-height: 1.5; color: #64748B; margin: 0 0 36px; }
        .login-input { width: 100%; height: 54px; background: #fff; border: 1px solid #D9E0E8; border-radius: 13px; padding: 0 16px 0 44px; font-size: 15px; color: #0f172a; box-sizing: border-box; transition: all 0.2s; outline: none; font-family: inherit; }
        .login-input:focus { border-color: #C8A43A; box-shadow: 0 0 0 3px rgba(200,164,58,0.12); }
        .login-input::placeholder { color: #cbd5e1; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 16px; color: #94a3b8; display: flex; align-items: center; pointer-events: none; }
        .pw-toggle { position: absolute; right: 16px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; display: flex; align-items: center; }
        .btn-sign-in { width: 100%; height: 56px; background: #D4AF37; color: #071A33; border: none; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 32px; transition: all 0.2s; font-family: inherit; }
        .btn-sign-in:hover:not(:disabled) { background: #C8A43A; }
        .btn-sign-in:disabled { opacity: 0.7; cursor: not-allowed; }
        .error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 16px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; }
        .mobile-logo { display: none; margin-bottom: 32px; width: 100%; justify-content: center; }
        @media (max-width: 1199px) { .hero-internal { padding: 48px; } .login-content { width: min(calc(100% - 48px), 420px); } }
        @media (max-width: 767px) {
          .login-layout { display: block; }
          .login-hero { display: none; }
          .login-panel { width: 100%; min-height: 100vh; align-items: flex-start; padding: 24px 0; }
          .login-content { width: min(calc(100% - 48px), 100%); margin: 0 auto; }
          .mobile-logo { display: flex; }
          .login-heading { font-size: 32px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(7,26,51,0.3); border-radius: 50%; border-top-color: #071A33; animation: spin 1s linear infinite; }
      `}</style>

      <div className="login-layout">
        {/* Hero Panel */}
        <div className="login-hero">
          <div className="hero-decoration" />
          <div className="hero-glow" />
          <div className="hero-internal">
            <div className="hero-content">
              <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
                <div className="logo-panel">
                  <img src="/assets/branding/sonthillu-logo.svg" alt="Sonthillu Constructions" />
                </div>
              </div>
              <h1 className="hero-heading">Grow Together.<br />Build Together.</h1>
              <p className="hero-desc">Your partner workspace for managing projects, bookings, commissions and opportunities.</p>
            </div>
          </div>
        </div>

        {/* Login Panel */}
        <div className="login-panel">
          <div className="login-content">
            <div className="mobile-logo">
              <div className="logo-panel">
                <img src="/assets/branding/sonthillu-logo.svg" alt="Sonthillu Constructions" style={{ width: 90 }} />
              </div>
            </div>

            <h2 className="login-heading">Welcome back</h2>
            <p className="login-subtitle">Sign in to continue to your partner workspace.</p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-banner">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
                  <div><strong style={{ marginBottom: 2, display: 'block' }}>Unable to sign in</strong><span>{error}</span></div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="input-label" htmlFor="userId" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>User ID</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>
                  </div>
                  <input
                    type="text" id="userId" className="login-input"
                    placeholder="Enter your User ID"
                    value={userId} onChange={e => setUserId(e.target.value)}
                    autoComplete="username" required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="input-label" htmlFor="password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" className="login-input"
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password" required
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
                    {showPassword
                      ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>
                      : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-sign-in" disabled={loading}>
                {loading ? <div className="spinner" /> : (
                  <>
                    <span>Sign In</span>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

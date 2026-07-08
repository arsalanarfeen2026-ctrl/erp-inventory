import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      if (!res.ok) setError(res.error);
      setLoading(false);
    }, 500);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0288d1 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <i className="ti ti-package" style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Utopia Production</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Printing Inventory</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Inventory Management System</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: '#898781', marginBottom: 24 }}>Enter your credentials to continue</p>

          {error && (
            <div style={{ background: 'rgba(227,73,72,0.08)', border: '0.5px solid rgba(227,73,72,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#a32d2d', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#52514e', marginBottom: 6, fontWeight: 500 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-user" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#898781', fontSize: 16 }} />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid rgba(11,11,11,0.15)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#52514e', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#898781', fontSize: 16 }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required
                  style={{ width: '100%', padding: '10px 40px 10px 38px', border: '1px solid rgba(11,11,11,0.15)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#898781', padding: 0 }}>
                  <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? '#93b8e8' : '#2a78d6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} /> Signing in…</> : <><i className="ti ti-login" /> Sign in</>}
            </button>
          </form>


        </div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>© 2026 InvTrack ERP</p>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { apiLogin, apiSignup } from '../api/client';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [role, setRole] = useState('freelancer'); // 'freelancer' | 'client'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim() || !email.includes('@')) newErrors.email = 'Enter a valid email address';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const res = await apiLogin({ email, password, role });
      onLoginSuccess(res.user, 'Logged in successfully!');
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Enter a valid email address';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const res = await apiSignup({ name, email, password, role });
      onLoginSuccess(res.user, 'Account created & logged in successfully!');
    } catch (err) {
      setServerError(err.message || 'Signup failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Quick Action
  const handleQuickDemoLogin = async (demoRole) => {
    setLoading(true);
    setServerError('');

    const demoEmail = demoRole === 'freelancer' ? 'elena.rostova@dev.com' : 'hiring@nexustech.io';
    const demoName = demoRole === 'freelancer' ? 'Elena Rostova' : 'Nexus Tech Labs';
    const demoPassword = 'password123';

    try {
      let res;
      try {
        res = await apiLogin({ email: demoEmail, password: demoPassword, role: demoRole });
      } catch {
        res = await apiSignup({ name: demoName, email: demoEmail, password: demoPassword, role: demoRole });
      }
      onLoginSuccess(res.user, `Logged in as Demo ${demoRole === 'freelancer' ? 'Freelancer' : 'Employer'}`);
    } catch (err) {
      // Fallback local mock if backend is unreachable
      const fallbackUser = {
        name: demoName,
        email: demoEmail,
        role: demoRole,
        avatar: demoRole === 'freelancer'
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        loggedIn: true
      };
      onLoginSuccess(fallbackUser, `Logged in as Demo ${demoRole === 'freelancer' ? 'Freelancer' : 'Employer'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
            <button 
              onClick={() => { setMode('login'); setServerError(''); }}
              style={{
                border: 'none',
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#FFF' : 'var(--text-muted)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Log In
            </button>
            <button 
              onClick={() => { setMode('signup'); setServerError(''); }}
              style={{
                border: 'none',
                background: mode === 'signup' ? 'var(--primary)' : 'transparent',
                color: mode === 'signup' ? '#FFF' : 'var(--text-muted)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>

          {serverError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#F43F5E',
              fontSize: '0.825rem',
              marginBottom: '1rem'
            }}>
              {serverError}
            </div>
          )}

          {/* Quick Demo Login Banner */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#818CF8', marginBottom: '0.5rem' }}>
              ⚡ Quick Demo 1-Click Login:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => handleQuickDemoLogin('freelancer')}
                disabled={loading}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                Demo Freelancer
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickDemoLogin('client')}
                disabled={loading}
                className="btn btn-sm btn-outline-primary"
                style={{ fontSize: '0.78rem' }}
              >
                Demo Employer
              </button>
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">I want to operate as:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.4rem' }}>
              <div 
                onClick={() => setRole('freelancer')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${role === 'freelancer' ? 'var(--primary)' : 'var(--border-medium)'}`,
                  background: role === 'freelancer' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: role === 'freelancer' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                💼 Work as Freelancer
              </div>

              <div 
                onClick={() => setRole('client')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${role === 'client' ? 'var(--secondary)' : 'var(--border-medium)'}`,
                  background: role === 'client' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: role === 'client' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                🏢 Hire as Employer
              </div>
            </div>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
                {errors.email && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
                {errors.password && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.password}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Remember me
                </label>
                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <LogIn size={18} /> {loading ? 'Logging in...' : 'Log In to Account'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
                {errors.name && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email"
                  placeholder="alex@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
                {errors.email && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.email}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                  {errors.password && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                  {errors.confirmPassword && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <input 
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  I agree to the WorkPulse Terms of Service & Privacy Policy
                </label>
                {errors.agreeTerms && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.agreeTerms}</span>}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <UserPlus size={18} /> {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

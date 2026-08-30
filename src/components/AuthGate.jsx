import React from 'react';
import { LogIn, UserPlus, Lock } from 'lucide-react';

export default function AuthGate({ title, message, onLogin, onSignup }) {
  return (
    <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--primary-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
        }}>
          <Lock size={24} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {title || 'Log in to continue'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          {message || 'You need an account to access this part of WorkPulse.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onLogin} className="btn btn-secondary">
            <LogIn size={16} /> Log In
          </button>
          <button onClick={onSignup} className="btn btn-primary">
            <UserPlus size={16} /> Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

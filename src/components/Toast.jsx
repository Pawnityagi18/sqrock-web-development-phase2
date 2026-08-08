import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      background: 'var(--bg-card)',
      border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1.25rem',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      maxWidth: '380px',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {toast.type === 'success' ? (
        <CheckCircle2 size={20} color="var(--accent-emerald)" />
      ) : (
        <Info size={20} color="var(--primary)" />
      )}
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFF', flex: 1 }}>
        {toast.message}
      </div>
      <button 
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

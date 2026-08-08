import React, { useState } from 'react';
import { X, Star, MapPin, Award, CheckCircle2, ShieldCheck, MessageSquare, Briefcase, ExternalLink } from 'lucide-react';

export default function FreelancerModal({ freelancer, onClose, onHireFreelancer }) {
  const [hireMessage, setHireMessage] = useState('');
  const [hireSent, setHireSent] = useState(false);

  const handleHireSubmit = (e) => {
    e.preventDefault();
    setHireSent(true);
    setTimeout(() => {
      onHireFreelancer(freelancer);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={freelancer.avatar} 
              alt={freelancer.name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {freelancer.name}
                {freelancer.verified && <ShieldCheck size={18} color="var(--accent-emerald)" />}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{freelancer.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                <span><MapPin size={12} /> {freelancer.location}</span> • 
                <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>★ {freelancer.rating} ({freelancer.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          
          {/* Key Metrics Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-input)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hourly Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                ${freelancer.hourlyRate}/hr
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Job Success Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                {freelancer.successRate}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Earnings</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-heading)' }}>
                ${freelancer.totalEarned.toLocaleString()}+
              </div>
            </div>
          </div>

          {/* About Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>About Freelancer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              {freelancer.bio}
            </p>
          </div>

          {/* Skills Matrix */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Skills & Expertise</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {freelancer.skills.map((skill, idx) => (
                <span key={idx} className="skill-pill" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818CF8' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Showcase */}
          {freelancer.portfolio && freelancer.portfolio.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Portfolio Samples</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {freelancer.portfolio.map((item, idx) => (
                  <div key={idx} className="glass-card" style={{ borderRadius: 'var(--radius-md)' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Reviews */}
          {freelancer.reviews && freelancer.reviews.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Recent Client Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {freelancer.reviews.map((rev, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rev.clientName}</span>
                      <span style={{ color: 'var(--accent-amber)', fontSize: '0.8rem' }}>★ {rev.rating}.0 ({rev.date})</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hire Direct Action Box */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem'
          }}>
            {hireSent ? (
              <div style={{ textAlign: 'center', color: 'var(--secondary)' }}>
                <CheckCircle2 size={32} style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontWeight: 700 }}>Hire Request Sent!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The freelancer will respond within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={16} color="var(--secondary)" /> Send Direct Project Offer to {freelancer.name}
                </h4>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <textarea 
                    rows={2}
                    placeholder="Describe your job offer, estimated budget, and timeline..."
                    value={hireMessage}
                    onChange={(e) => setHireMessage(e.target.value)}
                    className="form-textarea"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-emerald btn-sm">
                    <Briefcase size={14} /> Send Hire Offer (${freelancer.hourlyRate}/hr)
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

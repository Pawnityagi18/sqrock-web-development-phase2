import React, { useState } from 'react';
import { X, Send, DollarSign, Calendar, CheckCircle2, ShieldCheck, MapPin, AlertCircle, FileText } from 'lucide-react';

export default function ProjectModal({ project, onClose, onSubmitProposal, isSubmitted }) {
  const [freelancerName, setFreelancerName] = useState('Elena Rostova');
  const [freelancerEmail, setFreelancerEmail] = useState('elena.rostova@dev.com');
  const [bidAmount, setBidAmount] = useState(project.budget);
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState({});

  const platformFee = Math.round(bidAmount * 0.05);
  const netEarnings = bidAmount - platformFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!freelancerName.trim()) newErrors.freelancerName = 'Name is required';
    if (!freelancerEmail.trim() || !freelancerEmail.includes('@')) newErrors.freelancerEmail = 'Valid email is required';
    if (!bidAmount || bidAmount <= 0) newErrors.bidAmount = 'Please enter a valid bid amount';
    if (!coverLetter.trim() || coverLetter.length < 20) newErrors.coverLetter = 'Cover letter must be at least 20 characters long';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmitProposal({
      id: `prop-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      freelancerName,
      freelancerTitle: 'Freelancer Professional',
      freelancerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      bidAmount: Number(bidAmount),
      platformFee,
      netAmount: netEarnings,
      estimatedDays: Number(estimatedDays),
      coverLetter,
      status: 'Pending',
      submittedDate: 'Just now'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '840px' }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-category">{project.categoryName}</span>
              {project.urgency === 'Featured' && <span className="badge badge-featured">★ Featured</span>}
              {project.urgency === 'Urgent' && <span className="badge badge-urgent">⚡ Urgent</span>}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
              {project.title}
            </h2>
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
          
          {/* Project Summary Banner */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project Budget</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                ${project.budget.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({project.budgetType})</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Submission Deadline</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                {project.deadline} ({project.daysLeft} days left)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client Info</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {project.client.name} {project.client.verified && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
              </div>
            </div>
          </div>

          {/* Full Brief Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Project Description</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              {project.description}
            </p>
          </div>

          {/* Key Deliverables */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem' }}>Scope & Deliverables</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {project.deliverables.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Proposal Submission Form */}
          {isSubmitted ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={38} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>Proposal Submitted Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Your proposal has been logged in the client dashboard. You will receive notifications on updates.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="var(--primary)" /> Submit Your Proposal
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Freelancer Name</label>
                  <input 
                    type="text" 
                    value={freelancerName}
                    onChange={(e) => setFreelancerName(e.target.value)}
                    className="form-input"
                  />
                  {errors.freelancerName && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.freelancerName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    value={freelancerEmail}
                    onChange={(e) => setFreelancerEmail(e.target.value)}
                    className="form-input"
                  />
                  {errors.freelancerEmail && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.freelancerEmail}</span>}
                </div>
              </div>

              {/* Bid Amount & Platform Fee Calculator */}
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <label className="form-label">Your Bid Offer ($)</label>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="form-input"
                      style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}
                    />
                    {errors.bidAmount && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.bidAmount}</span>}
                  </div>

                  <div>
                    <label className="form-label" style={{ color: 'var(--text-dim)' }}>Platform Fee (5%)</label>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                      -${platformFee}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: 'var(--accent-emerald)' }}>Your Net Earnings</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', paddingTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                      ${netEarnings}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Delivery Duration (Days)</label>
                <input 
                  type="number" 
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Letter & Pitch Proposal</label>
                <textarea 
                  rows={4}
                  placeholder="Explain why you are the ideal freelancer for this project, past relevant experience, and technical approach..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="form-textarea"
                />
                {errors.coverLetter && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.coverLetter}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <Send size={16} /> Submit Proposal
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

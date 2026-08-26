import React, { useState } from 'react';
import { X, CheckCircle2, Clock, DollarSign, Send, ShieldCheck, FileText, UserCheck, Sparkles } from 'lucide-react';
import { generateAIProposal } from '../utils/aiGenerator';

export default function ProjectModal({ project, onClose, onSubmitProposal }) {
  const [freelancerName, setFreelancerName] = useState('Elena Rostova');
  const [freelancerEmail, setFreelancerEmail] = useState('elena.rostova@dev.com');
  const [bidAmount, setBidAmount] = useState(project.budget);
  const [estimatedDays, setEstimatedDays] = useState(project.daysLeft || 14);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Automated 5% Platform Fee Calculation
  const platformFee = Math.round(bidAmount * 0.05);
  const netEarnings = bidAmount - platformFee;

  // AI Proposal Cover Letter Generator Handler
  const handleGenerateAIProposal = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const aiPitch = generateAIProposal(project, freelancerName);
      setCoverLetter(aiPitch);
      setIsGeneratingAI(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!freelancerName.trim()) newErrors.freelancerName = 'Name is required';
    if (!freelancerEmail.trim() || !freelancerEmail.includes('@')) newErrors.freelancerEmail = 'Valid email is required';
    if (!bidAmount || bidAmount <= 0) newErrors.bidAmount = 'Valid bid offer required';
    if (!coverLetter.trim() || coverLetter.length < 20) newErrors.coverLetter = 'Proposal must be at least 20 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const proposalPayload = {
      projectId: project.id,
      projectTitle: project.title,
      freelancerName,
      freelancerEmail,
      bidAmount,
      platformFee,
      netAmount: netEarnings,
      estimatedDays,
      coverLetter
    };

    onSubmitProposal(proposalPayload);
    setIsSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-category">{project.categoryName || project.category}</span>
            <span className="badge badge-verified">Verified Project</span>
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

          {/* Project Title */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
            {project.title}
          </h2>

          {/* Project Summary Banner */}
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid var(--border-teal)',
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
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {project.deadline} ({project.daysLeft} days left)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client Info</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {project.client?.name || project.clientName} {(project.client?.verified || project.verifiedClient) && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
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
          {project.deliverables && (
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
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Proposal Submission Form */}
          {isSubmitted ? (
            <div style={{
              background: 'var(--accent-emerald-light)',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={38} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#047857' }}>Proposal Submitted Successfully!</h3>
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

              {/* Cover Letter with AI Proposal Generator Button */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Cover Letter & Pitch Proposal</label>
                  <button 
                    type="button"
                    onClick={handleGenerateAIProposal}
                    disabled={isGeneratingAI}
                    className="btn btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, #008080 0%, #0284C7 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      opacity: isGeneratingAI ? 0.7 : 1
                    }}
                  >
                    <Sparkles size={14} color="#F59E0B" fill="#F59E0B" /> 
                    {isGeneratingAI ? 'Generating AI Proposal...' : '✨ Generate AI Proposal'}
                  </button>
                </div>
                <textarea 
                  rows={6}
                  placeholder="Explain why you are the ideal freelancer for this project, or click '✨ Generate AI Proposal' above..."
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

import React, { useState } from 'react';
import { LayoutDashboard, CheckCircle2, Clock, XCircle, DollarSign, Send, FileText, Briefcase, Eye, ChevronRight } from 'lucide-react';

export default function Dashboard({ 
  userRole, 
  projects, 
  proposals, 
  onAcceptProposal, 
  onRejectProposal, 
  onUpdateProjectStatus,
  onOpenProjectModal
}) {
  const [activeTab, setActiveTab] = useState(userRole === 'client' ? 'posted-jobs' : 'my-proposals');

  // Freelancer Stats
  const totalEarned = proposals
    .filter(p => p.status === 'Accepted')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const pendingProposalsCount = proposals.filter(p => p.status === 'Pending').length;
  const acceptedProposalsCount = proposals.filter(p => p.status === 'Accepted').length;

  return (
    <section style={{ padding: '3.5rem 0' }}>
      <div className="container">
        
        {/* Dashboard Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              <LayoutDashboard size={16} /> WorkPulse Operations Center
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              {userRole === 'client' ? 'Employer Operations Dashboard' : 'Freelancer Workspace & Proposals'}
            </h2>
          </div>

          {/* Role Mode Indicator */}
          <span className={`badge ${userRole === 'client' ? 'badge-verified' : 'badge-category'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Current Mode: {userRole === 'client' ? 'Employer / Client' : 'Freelancer / Talent'}
          </span>
        </div>

        {/* Analytical Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Total Posted Jobs' : 'Submitted Proposals'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              {userRole === 'client' ? projects.length : proposals.length}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Pending Proposals Received' : 'Active Pending Bids'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              {pendingProposalsCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Accepted Contracts' : 'Accepted Proposals'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              {acceptedProposalsCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Total Project Volume' : 'Net Earned Revenue'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              ${userRole === 'client' 
                ? projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString() 
                : totalEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Dashboard Sub-Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}>
          {userRole === 'client' ? (
            <>
              <button 
                onClick={() => setActiveTab('posted-jobs')}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'posted-jobs' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'posted-jobs' ? '3px solid var(--primary)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Posted Jobs & Proposals ({projects.length})
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('my-proposals')}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'my-proposals' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'my-proposals' ? '3px solid var(--primary)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                My Submitted Proposals ({proposals.length})
              </button>
            </>
          )}
        </div>

        {/* Employer Posted Jobs Tab */}
        {userRole === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {projects.map((proj) => {
              const projectProposals = proposals.filter(p => p.projectId === proj.id);

              return (
                <div key={proj.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span className="badge badge-category">{proj.categoryName}</span>
                        <span className={`badge ${proj.status === 'Open' ? 'badge-verified' : 'badge-hot'}`}>{proj.status}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>{proj.title}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Budget</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>${proj.budget}</div>
                      </div>

                      {/* Change Status Dropdown */}
                      <select 
                        value={proj.status}
                        onChange={(e) => onUpdateProjectStatus(proj.id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Proposals for this job */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                      Received Proposals ({projectProposals.length})
                    </h4>

                    {projectProposals.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No proposals received for this posting yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {projectProposals.map((prop) => (
                          <div key={prop.id} style={{
                            background: 'var(--bg-input)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <img 
                                src={prop.freelancerAvatar} 
                                alt={prop.freelancerName}
                                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#FFF' }}>{prop.freelancerName}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  Bid: <strong style={{ color: 'var(--accent-emerald)' }}>${prop.bidAmount}</strong> • {prop.estimatedDays} days delivery
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', maxWidth: '500px' }}>
                                  "{prop.coverLetter}"
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {prop.status === 'Pending' ? (
                                <>
                                  <button 
                                    onClick={() => onAcceptProposal(prop.id)}
                                    className="btn btn-emerald btn-sm"
                                  >
                                    <CheckCircle2 size={14} /> Accept & Hire
                                  </button>
                                  <button 
                                    onClick={() => onRejectProposal(prop.id)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ color: 'var(--accent-rose)' }}
                                  >
                                    <XCircle size={14} /> Decline
                                  </button>
                                </>
                              ) : (
                                <span className={`badge ${prop.status === 'Accepted' ? 'badge-verified' : 'badge-urgent'}`}>
                                  Status: {prop.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Freelancer Submitted Proposals Tab */}
        {userRole === 'freelancer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {proposals.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Send size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Proposals Submitted Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Browse projects and submit your first bid to start earning.</p>
              </div>
            ) : (
              proposals.map((prop) => (
                <div key={prop.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                        Submitted {prop.submittedDate}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>
                        {prop.projectTitle}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '650px' }}>
                        "{prop.coverLetter}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Your Offer</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                          ${prop.bidAmount}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Net: ${prop.netAmount}</div>
                      </div>

                      <span className={`badge ${prop.status === 'Accepted' ? 'badge-verified' : prop.status === 'Pending' ? 'badge-featured' : 'badge-urgent'}`}>
                        {prop.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </section>
  );
}

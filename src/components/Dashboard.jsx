import React, { useState } from 'react';
import { LayoutDashboard, CheckCircle2, Clock, XCircle, DollarSign, Send, FileText, Briefcase, Eye, Shield, MessageSquare } from 'lucide-react';
import ContractsPanel from './ContractsPanel';
import MessagesPanel from './MessagesPanel';

export default function Dashboard({ 
  userRole, 
  projects, 
  proposals, 
  contracts = [],
  currentUser,
  onAcceptProposal, 
  onRejectProposal, 
  onUpdateProjectStatus,
  onOpenProjectModal,
  onRefreshContracts
}) {
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'posts-proposals' | 'messages'
  const [selectedChatContract, setSelectedChatContract] = useState(null);

  // Stats
  const totalEarned = proposals
    .filter(p => p.status === 'Accepted' || p.status === 'accepted')
    .reduce((sum, p) => sum + (p.netAmount || p.bidAmount || 0), 0);

  const pendingProposalsCount = proposals.filter(p => p.status === 'Pending' || p.status === 'pending').length;
  const acceptedProposalsCount = proposals.filter(p => p.status === 'Accepted' || p.status === 'accepted').length;
  const activeContractsCount = contracts.filter(c => c.status === 'active').length;

  const handleOpenChat = (contract) => {
    setSelectedChatContract(contract);
    setActiveTab('messages');
  };

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
              <LayoutDashboard size={16} /> WorkPulse Enterprise Command Center
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
              {userRole === 'client' ? 'Employer Workspace & Escrow Hub' : 'Freelancer Earnings & Active Contracts'}
            </h2>
          </div>

          {/* Role Mode Indicator */}
          <span className={`badge ${userRole === 'client' ? 'badge-verified' : 'badge-category'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Current Role: {userRole === 'client' ? 'Employer / Client' : 'Freelancer / Talent'}
          </span>
        </div>

        {/* Metric Cards */}
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
              Active Escrow Contracts
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              {activeContractsCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Pending Proposals' : 'Active Pending Bids'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              {pendingProposalsCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {userRole === 'client' ? 'Total Project Volume' : 'Total Revenue Earned'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
              ${userRole === 'client' 
                ? projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString() 
                : totalEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          overflowX: 'auto'
        }}>
          <button 
            onClick={() => setActiveTab('contracts')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'contracts' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'contracts' ? '3px solid var(--primary)' : 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Shield size={16} /> Contracts & Escrow Payments ({contracts.length})
          </button>

          <button 
            onClick={() => setActiveTab('posts-proposals')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'posts-proposals' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'posts-proposals' ? '3px solid var(--primary)' : 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={16} /> {userRole === 'client' ? `Posted Jobs (${projects.length})` : `Submitted Proposals (${proposals.length})`}
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'messages' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'messages' ? '3px solid var(--primary)' : 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageSquare size={16} /> Messages & Work Room
          </button>
        </div>

        {/* TAB 1: CONTRACTS & ESCROW PAYMENTS */}
        {activeTab === 'contracts' && (
          <ContractsPanel 
            contracts={contracts}
            currentUser={currentUser}
            onRefresh={onRefreshContracts}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* TAB 2: POSTED JOBS / PROPOSALS */}
        {activeTab === 'posts-proposals' && (
          <>
            {userRole === 'client' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {projects.map((proj) => {
                  const projIdStr = proj._id || proj.id;
                  const projectProposals = proposals.filter(p => {
                    const pProjId = p.project?._id || p.project || p.projectId;
                    return pProjId === projIdStr;
                  });

                  return (
                    <div key={projIdStr} className="glass-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span className="badge badge-category">{proj.category}</span>
                            <span className={`badge ${proj.status === 'Open' ? 'badge-verified' : 'badge-hot'}`}>{proj.status}</span>
                          </div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>{proj.title}</h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Budget</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>${proj.budget}</div>
                          </div>

                          <select 
                            value={proj.status}
                            onChange={(e) => onUpdateProjectStatus(projIdStr, e.target.value)}
                            className="form-select"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

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
                            {projectProposals.map((prop) => {
                              const propIdStr = prop._id || prop.id;
                              const freelancerName = prop.freelancer?.name || prop.freelancerName || 'Freelancer';
                              const freelancerAvatar = prop.freelancer?.avatar || prop.freelancerAvatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80';

                              return (
                                <div key={propIdStr} style={{
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
                                      src={freelancerAvatar} 
                                      alt={freelancerName}
                                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                      <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#FFF' }}>{freelancerName}</div>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Bid: <strong style={{ color: 'var(--accent-emerald)' }}>${prop.bidAmount}</strong> • {prop.estimatedDays} days delivery
                                      </div>
                                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', maxWidth: '500px' }}>
                                        "{prop.coverLetter}"
                                      </p>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {prop.status === 'Pending' || prop.status === 'pending' ? (
                                      <>
                                        <button 
                                          onClick={() => onAcceptProposal(propIdStr)}
                                          className="btn btn-emerald btn-sm"
                                        >
                                          <CheckCircle2 size={14} /> Accept Proposal & Create Contract
                                        </button>
                                        <button 
                                          onClick={() => onRejectProposal(propIdStr)}
                                          className="btn btn-secondary btn-sm"
                                          style={{ color: 'var(--accent-rose)' }}
                                        >
                                          <XCircle size={14} /> Decline
                                        </button>
                                      </>
                                    ) : (
                                      <span className={`badge ${prop.status === 'Accepted' || prop.status === 'accepted' ? 'badge-verified' : 'badge-urgent'}`}>
                                        Status: {prop.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {proposals.length === 0 ? (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Send size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Proposals Submitted Yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Browse open projects and submit your first bid to start earning.</p>
                  </div>
                ) : (
                  proposals.map((prop) => {
                    const propIdStr = prop._id || prop.id;
                    const projTitle = prop.project?.title || prop.projectTitle || 'Freelance Task';

                    return (
                      <div key={propIdStr} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>
                              {projTitle}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '650px' }}>
                              "{prop.coverLetter}"
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Your Bid</div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                                ${prop.bidAmount}
                              </div>
                            </div>

                            <span className={`badge ${prop.status === 'Accepted' || prop.status === 'accepted' ? 'badge-verified' : prop.status === 'Pending' || prop.status === 'pending' ? 'badge-featured' : 'badge-urgent'}`}>
                              {prop.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 3: MESSAGES & WORK ROOM */}
        {activeTab === 'messages' && (
          <div>
            {contracts.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <MessageSquare size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Active Workroom Chat</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Workroom messaging unlocks automatically as soon as a contract is active between client and freelancer.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: selectedChatContract ? '300px 1fr' : '1fr', gap: '1.5rem' }}>
                {/* Contract selector */}
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    Active Workrooms ({contracts.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {contracts.map((c) => {
                      const other = currentUser?.role === 'client' ? c.freelancer : c.client;
                      const isSelected = selectedChatContract?._id === c._id;
                      return (
                        <div 
                          key={c._id} 
                          onClick={() => setSelectedChatContract(c)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>{c.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            With: {other?.name || 'User'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Workroom Chat */}
                {selectedChatContract ? (
                  <MessagesPanel 
                    contract={selectedChatContract}
                    currentUser={currentUser}
                    onClose={() => setSelectedChatContract(null)}
                  />
                ) : (
                  <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <MessageSquare size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a contract from the list to enter the private workroom chat.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

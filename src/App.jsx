import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import ProjectList from './components/ProjectList';
import FreelancerList from './components/FreelancerList';
import ProjectModal from './components/ProjectModal';
import FreelancerModal from './components/FreelancerModal';
import PostProjectModal from './components/PostProjectModal';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Toast from './components/Toast';

import { INITIAL_CATEGORIES as CATEGORIES, INITIAL_PROJECTS, INITIAL_FREELANCERS, INITIAL_PROPOSALS } from './data/mockData';
import { apiFetchProjects, apiCreateProject, apiFetchProposals, apiSubmitProposal, checkServerHealth } from './api/client';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'freelancers' | 'dashboard'
  const [userRole, setUserRole] = useState('freelancer'); // 'freelancer' | 'client'
  
  // Full-Stack Server Status State
  const [serverOnline, setServerOnline] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('workpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Projects State
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('workpulse_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  // Saved/Bookmarked Project IDs
  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    const saved = localStorage.getItem('workpulse_saved_projects');
    return saved ? JSON.parse(saved) : [1, 3];
  });

  // Freelancers State
  const [freelancers] = useState(INITIAL_FREELANCERS);

  // Proposals State
  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('workpulse_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState(10000);
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  // Modal Control States
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'login' });

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('workpulse_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('workpulse_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('workpulse_saved_projects', JSON.stringify(savedProjectIds));
  }, [savedProjectIds]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('workpulse_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('workpulse_user');
    }
  }, [currentUser]);

  // Initial Full-Stack API Sync
  useEffect(() => {
    const initServerSync = async () => {
      const isOnline = await checkServerHealth();
      setServerOnline(isOnline);

      if (isOnline) {
        const remoteProjects = await apiFetchProjects(INITIAL_PROJECTS);
        if (remoteProjects && remoteProjects.length > 0) setProjects(remoteProjects);

        const remoteProposals = await apiFetchProposals(INITIAL_PROPOSALS);
        if (remoteProposals && remoteProposals.length > 0) setProposals(remoteProposals);
      }
    };

    initServerSync();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Toggle Bookmark Handler
  const handleToggleSaveProject = (projectId) => {
    setSavedProjectIds(prev => {
      const isSaved = prev.includes(projectId);
      const next = isSaved ? prev.filter(id => id !== projectId) : [...prev, projectId];
      showToast(isSaved ? 'Removed from saved projects' : 'Project saved to bookmarks!', 'info');
      return next;
    });
  };

  // Create Project Handler
  const handleCreateProject = async (newProjData) => {
    const newProject = {
      id: projects.length + 1,
      ...newProjData,
      postedTime: 'Just now',
      clientName: currentUser ? currentUser.name : 'Nexus Innovations',
      clientCompany: currentUser ? `${currentUser.name} Labs` : 'Nexus Innovations',
      clientAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verifiedClient: true,
      proposalsCount: 0,
      status: 'Open'
    };

    const savedResult = await apiCreateProject(newProject);
    setProjects(prev => [savedResult, ...prev]);
    setIsPostModalOpen(false);
    showToast('🎉 Project posted successfully on WorkPulse!');
  };

  // Submit Proposal Handler
  const handleSubmitProposal = async (proposalData) => {
    const newProposal = {
      id: proposals.length + 1,
      ...proposalData,
      freelancerName: currentUser ? currentUser.name : 'Elena Rostova',
      freelancerAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      submittedDate: 'Just now',
      status: 'Pending'
    };

    const savedResult = await apiSubmitProposal(newProposal);
    setProposals(prev => [savedResult, ...prev]);

    // Update project proposal count locally
    setProjects(prev => prev.map(p => p.id === proposalData.projectId ? { ...p, proposalsCount: p.proposalsCount + 1 } : p));

    setSelectedProject(null);
    showToast('🚀 Proposal submitted successfully to employer!');
  };

  // Accept / Decline Proposal Handler
  const handleAcceptProposal = (proposalId) => {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'Accepted' } : p));
    showToast('Contract Accepted! Freelancer has been notified.', 'success');
  };

  const handleRejectProposal = (proposalId) => {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'Declined' } : p));
    showToast('Proposal declined.', 'info');
  };

  // Auth Handlers
  const handleLoginSuccess = (userObj, msg) => {
    setCurrentUser(userObj);
    setUserRole(userObj.role);
    setAuthModalConfig({ isOpen: false, mode: 'login' });
    showToast(msg || `Welcome back, ${userObj.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Bar Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        savedCount={savedProjectIds.length}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        proposalsCount={proposals.length}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => setAuthModalConfig({ isOpen: true, mode })}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        
        {/* Full-Stack Status Badge Banner */}
        <div style={{ background: serverOnline ? '#E6F5F5' : '#FFFBEB', padding: '0.4rem 1rem', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
          {serverOnline ? (
            <span style={{ color: 'var(--primary)' }}>🟢 Full-Stack Express Server connected at http://localhost:5000/api</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>⚡ Operating in High-Performance Local Client Mode</span>
          )}
        </div>

        {activeTab === 'explore' && (
          <>
            {/* Hero Section */}
            <Hero 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={CATEGORIES}
              onSearchSubmit={() => {
                const el = document.getElementById('project-list-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Service Categories Grid */}
            <CategoryGrid 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Projects Explorer with Left Filter Sidebar */}
            <div id="project-list-section">
              <ProjectList 
                projects={projects}
                categories={CATEGORIES}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                budgetRange={budgetRange}
                setBudgetRange={setBudgetRange}
                selectedUrgency={selectedUrgency}
                setSelectedUrgency={setSelectedUrgency}
                savedProjectIds={savedProjectIds}
                onToggleSaveProject={handleToggleSaveProject}
                onOpenProjectModal={(proj) => setSelectedProject(proj)}
              />
            </div>
          </>
        )}

        {activeTab === 'freelancers' && (
          <FreelancerList 
            freelancers={freelancers}
            onOpenFreelancerModal={(freelancer) => setSelectedFreelancer(freelancer)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            userRole={userRole}
            projects={projects}
            proposals={proposals}
            onAcceptProposal={handleAcceptProposal}
            onRejectProposal={handleRejectProposal}
            onUpdateProjectStatus={(id, status) => {
              setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
              showToast(`Project status updated to ${status}`);
            }}
            onOpenProjectModal={(proj) => setSelectedProject(proj)}
          />
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmitProposal={handleSubmitProposal}
        />
      )}

      {selectedFreelancer && (
        <FreelancerModal 
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onDirectHire={(hireData) => {
            setSelectedFreelancer(null);
            showToast(`Direct Hire Offer sent to ${selectedFreelancer.name}!`);
          }}
        />
      )}

      {isPostModalOpen && (
        <PostProjectModal 
          categories={CATEGORIES}
          onClose={() => setIsPostModalOpen(false)}
          onSubmitProject={handleCreateProject}
        />
      )}

      {authModalConfig.isOpen && (
        <AuthModal 
          initialMode={authModalConfig.mode}
          onClose={() => setAuthModalConfig({ isOpen: false, mode: 'login' })}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
}

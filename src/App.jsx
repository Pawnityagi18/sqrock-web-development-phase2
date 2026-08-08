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

import { 
  INITIAL_CATEGORIES, 
  INITIAL_PROJECTS, 
  INITIAL_FREELANCERS, 
  INITIAL_PROPOSALS 
} from './data/mockData';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'freelancers' | 'dashboard'
  const [userRole, setUserRole] = useState('freelancer'); // 'freelancer' | 'client'

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('workpulse_auth_user');
    return saved ? JSON.parse(saved) : {
      name: 'Elena Rostova',
      email: 'elena.rostova@dev.com',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      loggedIn: true
    };
  });

  // Data Collections with LocalStorage Fallback
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('workpulse_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [freelancers, setFreelancers] = useState(() => {
    const saved = localStorage.getItem('workpulse_freelancers');
    return saved ? JSON.parse(saved) : INITIAL_FREELANCERS;
  });

  const [proposals, setProposals] = useState(() => {
    const saved = localStorage.getItem('workpulse_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [savedProjects, setSavedProjects] = useState(() => {
    const saved = localStorage.getItem('workpulse_saved');
    return saved ? JSON.parse(saved) : ['proj-1'];
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState(10000);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Modals & Notifications
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'signup' | null
  const [toast, setToast] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('workpulse_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('workpulse_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('workpulse_saved', JSON.stringify(savedProjects));
  }, [savedProjects]);

  useEffect(() => {
    localStorage.setItem('workpulse_auth_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user, successMsg) => {
    setCurrentUser(user);
    if (user.role === 'client') {
      setUserRole('client');
    } else {
      setUserRole('freelancer');
    }
    setAuthModalMode(null);
    showToast(successMsg, 'success');
  };

  const handleLogout = () => {
    setCurrentUser({ loggedIn: false });
    showToast('Logged out of session');
  };

  // Toggle Saved Project
  const handleToggleSaveProject = (id) => {
    if (savedProjects.includes(id)) {
      setSavedProjects(savedProjects.filter(pId => pId !== id));
      showToast('Project removed from saved bookmarks');
    } else {
      setSavedProjects([...savedProjects, id]);
      showToast('Project bookmarked!', 'success');
    }
  };

  // Submit New Proposal
  const handleSubmitProposal = (newProposal) => {
    setProposals([newProposal, ...proposals]);
    
    setProjects(projects.map(p => {
      if (p.id === newProposal.projectId) {
        return { ...p, proposalsCount: p.proposalsCount + 1 };
      }
      return p;
    }));

    showToast('Proposal submitted successfully!', 'success');
  };

  // Publish New Project
  const handlePublishProject = (newProject) => {
    setProjects([newProject, ...projects]);
    setPostModalOpen(false);
    showToast('Your project has been posted to the marketplace!', 'success');
    setActiveTab('explore');
  };

  // Accept Proposal (Employer)
  const handleAcceptProposal = (proposalId) => {
    setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'Accepted' } : p));
    showToast('Proposal accepted! Freelancer notified.', 'success');
  };

  // Reject Proposal (Employer)
  const handleRejectProposal = (proposalId) => {
    setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'Declined' } : p));
    showToast('Proposal declined');
  };

  // Update Project Status
  const handleUpdateProjectStatus = (projectId, newStatus) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    showToast(`Project status updated to ${newStatus}`, 'success');
  };

  // Filtered & Sorted Projects
  const filteredProjects = projects.filter(proj => {
    if (selectedCategory !== 'all' && proj.category !== selectedCategory) return false;
    if (proj.budget > budgetRange) return false;
    if (urgencyFilter !== 'all' && proj.urgency !== urgencyFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = proj.title.toLowerCase().includes(q);
      const skillMatch = proj.skills.some(s => s.toLowerCase().includes(q));
      const descMatch = proj.description.toLowerCase().includes(q);
      if (!titleMatch && !skillMatch && !descMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'budget-high') return b.budget - a.budget;
    if (sortBy === 'budget-low') return a.budget - b.budget;
    if (sortBy === 'proposals') return b.proposalsCount - a.proposalsCount;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      
      {/* Header Bar */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        savedCount={savedProjects.length}
        proposalsCount={proposals.length}
        onOpenPostModal={() => setPostModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => setAuthModalMode(mode)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'explore' && (
          <>
            <Hero 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={INITIAL_CATEGORIES}
              onSearchSubmit={() => {}}
            />

            <CategoryGrid 
              categories={INITIAL_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <ProjectList 
              projects={filteredProjects}
              categories={INITIAL_CATEGORIES}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              budgetRange={budgetRange}
              setBudgetRange={setBudgetRange}
              urgencyFilter={urgencyFilter}
              setUrgencyFilter={setUrgencyFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              savedProjects={savedProjects}
              onToggleSaveProject={handleToggleSaveProject}
              onSelectProject={setSelectedProject}
            />

            <FreelancerList 
              freelancers={freelancers}
              onSelectFreelancer={setSelectedFreelancer}
            />
          </>
        )}

        {activeTab === 'freelancers' && (
          <FreelancerList 
            freelancers={freelancers}
            onSelectFreelancer={setSelectedFreelancer}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            userRole={userRole}
            projects={projects}
            proposals={proposals}
            onAcceptProposal={handleAcceptProposal}
            onRejectProposal={handleRejectProposal}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onOpenProjectModal={setSelectedProject}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmitProposal={handleSubmitProposal}
          isSubmitted={proposals.some(p => p.projectId === selectedProject.id)}
        />
      )}

      {selectedFreelancer && (
        <FreelancerModal 
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onHireFreelancer={(free) => {
            showToast(`Hire offer sent to ${free.name}!`, 'success');
            setSelectedFreelancer(null);
          }}
        />
      )}

      {postModalOpen && (
        <PostProjectModal 
          categories={INITIAL_CATEGORIES}
          onClose={() => setPostModalOpen(false)}
          onSubmitProject={handlePublishProject}
        />
      )}

      {authModalMode && (
        <AuthModal 
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}

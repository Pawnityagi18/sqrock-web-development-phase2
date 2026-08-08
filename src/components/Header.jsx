import React, { useState } from 'react';
import { Briefcase, Search, UserCheck, PlusCircle, LayoutDashboard, Bookmark, LogIn, UserPlus, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  setUserRole, 
  savedCount, 
  onOpenPostModal, 
  proposalsCount,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'var(--bg-glass-heavy)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Briefcase size={22} color="#FFFFFF" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              WorkPulse
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'var(--secondary)',
              letterSpacing: '0.08em',
              display: 'block',
              marginTop: '-4px',
              textTransform: 'uppercase'
            }}>
              Freelance Marketplace
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`btn ${activeTab === 'explore' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'explore' ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === 'explore' ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none'
            }}
          >
            <Search size={16} /> Browse Jobs
          </button>
          
          <button 
            onClick={() => setActiveTab('freelancers')}
            className={`btn ${activeTab === 'freelancers' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'freelancers' ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === 'freelancers' ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none'
            }}
          >
            <UserCheck size={16} /> Find Talent
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              position: 'relative'
            }}
          >
            <LayoutDashboard size={16} /> Dashboard
            {proposalsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald)'
              }} />
            )}
          </button>
        </nav>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Role Switcher Pill */}
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => setUserRole('freelancer')}
              style={{
                border: 'none',
                background: userRole === 'freelancer' ? 'var(--primary)' : 'transparent',
                color: userRole === 'freelancer' ? '#FFF' : 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Freelancer
            </button>
            <button 
              onClick={() => setUserRole('client')}
              style={{
                border: 'none',
                background: userRole === 'client' ? 'var(--secondary)' : 'transparent',
                color: userRole === 'client' ? '#000' : 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Employer
            </button>
          </div>

          {/* Saved Items Icon */}
          <div 
            onClick={() => setActiveTab('explore')}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              transition: 'color 0.2s ease'
            }}
            title="Bookmarked Projects"
          >
            <Bookmark size={20} />
            {savedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: 'var(--primary)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {savedCount}
              </span>
            )}
          </div>

          {/* User Auth Section */}
          {currentUser && currentUser.loggedIn ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)'
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '220px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.75rem',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  zIndex: 1000
                }}>
                  <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                    <span className="badge badge-category" style={{ marginTop: '0.35rem' }}>
                      Mode: {currentUser.role === 'freelancer' ? 'Freelancer' : 'Employer'}
                    </span>
                  </div>

                  <button 
                    onClick={() => { setActiveTab('dashboard'); setProfileDropdownOpen(false); }}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <LayoutDashboard size={14} /> My Dashboard
                  </button>

                  <button 
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', color: 'var(--accent-rose)' }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => onOpenAuthModal('login')}
                className="btn btn-secondary btn-sm"
              >
                <LogIn size={15} /> Log In
              </button>
              <button 
                onClick={() => onOpenAuthModal('signup')}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={15} /> Sign Up
              </button>
            </div>
          )}

          {/* Post Project Button */}
          <button 
            onClick={onOpenPostModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={17} /> Post Project
          </button>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button 
            onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
            className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}
          >
            <Search size={16} /> Browse Projects
          </button>
          <button 
            onClick={() => { setActiveTab('freelancers'); setMobileMenuOpen(false); }}
            className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}
          >
            <UserCheck size={16} /> Find Freelancers
          </button>
          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          {!currentUser?.loggedIn && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ flex: 1 }}>
                Log In
              </button>
              <button onClick={() => { onOpenAuthModal('signup'); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ flex: 1 }}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

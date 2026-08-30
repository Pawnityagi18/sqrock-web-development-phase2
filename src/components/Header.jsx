import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, PlusCircle, LayoutDashboard, Bookmark, LogIn, UserPlus, LogOut, ChevronDown, Trash2, Menu, X, Bell, Camera } from 'lucide-react';
import { apiFetchNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead, apiUploadAvatar } from '../api/client';

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
  onLogout,
  onDeleteAccount,
  onUpdateUser
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !currentUser.loggedIn) return;
    const loadNotifications = () => {
      apiFetchNotifications().then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      });
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await apiMarkNotificationRead(notif._id);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) {
      setActiveTab('dashboard');
    }
    setNotifDropdownOpen(false);
  };

  const handleMarkAllRead = async () => {
    await apiMarkAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await apiUploadAvatar(file);
      if (result.avatar && onUpdateUser) {
        onUpdateUser({ ...currentUser, avatar: result.avatar });
      }
    } catch (err) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const isLoggedIn = Boolean(currentUser && currentUser.loggedIn);
  const role = currentUser?.role; // 'freelancer' | 'client' | undefined when logged out

  const handleDeleteAccountClick = () => {
    if (window.confirm('⚠️ Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      onDeleteAccount();
      setProfileDropdownOpen(false);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'var(--bg-glass-heavy)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)'
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
          <img 
            src="/logo.jpg" 
            alt="WorkPulse Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: 'var(--shadow-primary)',
              border: '1.5px solid var(--border-teal)'
            }}
          />
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.02em'
            }}>
              WorkPulse
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
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
          {(!isLoggedIn || role === 'freelancer') && (
            <button 
              onClick={() => isLoggedIn ? setActiveTab('explore') : onOpenAuthModal('login')}
              className={`btn ${activeTab === 'explore' ? 'btn-secondary' : ''}`}
              style={{ 
                color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'explore' ? 'var(--primary-light)' : 'transparent',
                border: 'none'
              }}
            >
              <Search size={16} /> Browse Jobs
            </button>
          )}
          
          {(!isLoggedIn || role === 'client') && (
            <button 
              onClick={() => isLoggedIn ? setActiveTab('freelancers') : onOpenAuthModal('login')}
              className={`btn ${activeTab === 'freelancers' ? 'btn-secondary' : ''}`}
              style={{ 
                color: activeTab === 'freelancers' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'freelancers' ? 'var(--primary-light)' : 'transparent',
                border: 'none'
              }}
            >
              <UserCheck size={16} /> Find Talent
            </button>
          )}

          {isLoggedIn && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`btn ${activeTab === 'dashboard' ? 'btn-secondary' : ''}`}
              style={{ 
                color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent',
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
          )}
        </nav>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Account Type Indicator — reflects the real logged-in role, not a free toggle */}
          {isLoggedIn && (
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span 
                style={{
                  border: 'none',
                  background: role === 'freelancer' ? 'var(--primary)' : 'transparent',
                  color: role === 'freelancer' ? '#FFF' : 'var(--text-dim)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                Freelancer
              </span>
              <span 
                style={{
                  border: 'none',
                  background: role === 'client' ? 'var(--secondary)' : 'transparent',
                  color: role === 'client' ? '#FFF' : 'var(--text-dim)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                Employer
              </span>
            </div>
          )}

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
                backgroundColor: 'var(--accent-sun)',
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

          {/* Notification Bell */}
          {currentUser && currentUser.loggedIn && (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '0', right: '0',
                    backgroundColor: 'var(--accent-rose, #f43f5e)', color: '#FFF',
                    fontSize: '0.65rem', fontWeight: 700, width: '16px', height: '16px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 1000
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{
                        background: 'none', border: 'none', color: 'var(--primary)',
                        fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                      }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotifClick(n)}
                        style={{
                          padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer', background: n.read ? 'transparent' : 'var(--bg-input)'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
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
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                  width: '230px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.75rem',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  zIndex: 1000
                }}>
                  <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.name}</div>
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
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <Camera size={14} /> {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarFileSelected}
                    style={{ display: 'none' }}
                  />

                  <button 
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>

                  <button 
                    onClick={handleDeleteAccountClick}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', color: 'var(--accent-rose)', border: '1px solid var(--accent-rose-light)', background: 'var(--accent-rose-light)' }}
                  >
                    <Trash2 size={14} /> Delete Account
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

          {/* Post Project Button — client-only marketplace action */}
          {(!isLoggedIn || role === 'client') && (
            <button 
              onClick={() => isLoggedIn ? onOpenPostModal() : onOpenAuthModal('login')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={17} /> Post Project
            </button>
          )}

        </div>
      </div>
    </header>
  );
}

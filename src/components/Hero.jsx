import React from 'react';
import { Search, Sparkles, TrendingUp, Users, CheckCircle2, DollarSign } from 'lucide-react';
import { PLATFORM_STATS } from '../data/mockData';

export default function Hero({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories, onSearchSubmit }) {
  return (
    <div style={{
      position: 'relative',
      padding: '4rem 0 3.5rem 0',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent 100%)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        
        {/* Animated Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818CF8',
            fontSize: '0.825rem',
            fontWeight: 600
          }}>
            <Sparkles size={15} color="#A78BFA" /> WorkPulse Marketplace • #1 Freelance Platform
          </div>
        </div>

        {/* Main Headline */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.25rem auto' }}>
          <h1 style={{
            fontSize: '2.85rem',
            lineHeight: 1.18,
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.03em'
          }}>
            Find Top World-Class <span style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Freelance Talent</span> & Scale Your Vision
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            fontWeight: 400
          }}>
            Connect with verified experts in Web Development, Mobile Apps, AI Engineering, and UI/UX Design. Fast proposals, secure milestones, and zero friction.
          </p>
        </div>

        {/* Multi-Input Search Box */}
        <div style={{
          maxWidth: '850px',
          margin: '0 auto 2rem auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.6rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Keyword Search Input */}
          <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', padding: '0 0.75rem', gap: '0.5rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by job title or required skills (e.g. Next.js, Figma)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Category Selector */}
          <div style={{ flex: '0 0 220px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.5rem' }}>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <option value="all" style={{ background: '#111726', color: '#FFF' }}>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ background: '#111726', color: '#FFF' }}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Action Button */}
          <button 
            onClick={onSearchSubmit}
            className="btn btn-primary btn-lg"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            Search Jobs
          </button>
        </div>

        {/* Popular Tag Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '3rem'
        }}>
          <span style={{ fontWeight: 600 }}>Popular Searches:</span>
          {['React.js', 'Figma UI/UX', 'Flutter App', 'Python AI', 'Stripe API', 'DevOps'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Platform Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={22} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{PLATFORM_STATS.activeProjects}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Active Projects Posted</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} color="var(--secondary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{PLATFORM_STATS.verifiedFreelancers}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Verified Freelancers</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={22} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{PLATFORM_STATS.totalPaidOut}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Paid to Freelancers</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{PLATFORM_STATS.jobSuccessRate}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Job Success Rate</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

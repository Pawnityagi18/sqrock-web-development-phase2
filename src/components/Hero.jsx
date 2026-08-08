import React from 'react';
import { Sparkles, TrendingUp, Users, CheckCircle2, DollarSign, ArrowRight, Star } from 'lucide-react';
import { PLATFORM_STATS } from '../data/mockData';

export default function Hero({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories, onSearchSubmit }) {
  return (
    <div style={{
      position: 'relative',
      padding: '4.5rem 0 4rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Text & Multi-Input Search */}
          <div>
            {/* Top Interactive Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFFFFF',
                border: '1px solid var(--border-teal)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Sparkles size={16} color="var(--accent-sun)" fill="var(--accent-sun)" /> 
                WorkPulse Marketplace • Top Creative Talent
              </div>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '3.1rem',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-main)'
            }}>
              Find Creative <span style={{
                color: 'var(--primary)',
                position: 'relative'
              }}>
                Freelancers
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'var(--accent-sun)'
                }} />
              </span> For Your Next Big Idea
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Connect with top-rated UI/UX Designers, React Developers, and AI Engineers to bring your vision to life.
            </p>

            {/* Multi-Input Search Box with Brand Logo */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '0.65rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              {/* Keyword Input with WorkPulse Logo */}
              <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', padding: '0 0.5rem', gap: '0.65rem' }}>
                <img 
                  src="/logo.jpg" 
                  alt="WorkPulse Logo"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(0,128,128,0.2)'
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Search a Freelancer or Job (e.g. UI/UX, React)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                />
              </div>

              {/* Category Select */}
              <div style={{ flex: '0 0 180px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.5rem' }}>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Search Action */}
              <button 
                onClick={onSearchSubmit}
                className="btn btn-primary btn-lg"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Hire a Freelancer <ArrowRight size={18} />
              </button>
            </div>

            {/* Popular Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Popular:</span>
              {['UI/UX Design', 'React.js', 'Mobile App', 'Python AI', 'Figma'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Hero Graphic Banner */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* Background Golden Circle Graphic */}
            <div style={{
              position: 'absolute',
              top: '5%',
              left: '15%',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'var(--accent-sun)',
              opacity: 0.85,
              zIndex: 1
            }} />

            {/* Main Showcase Hero Image */}
            <div style={{ position: 'relative', zIndex: 2, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80" 
                alt="Top Creative Freelancer"
                style={{ width: '100%', maxWidth: '440px', display: 'block', borderRadius: 'var(--radius-xl)' }}
              />

              {/* Floating Badge Card 1 */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#FFFFFF',
                padding: '0.85rem 1.1rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>UI/UX Design Jobs</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>$4,500 / project</div>
                <span className="badge badge-verified" style={{ alignSelf: 'flex-start' }}>★ 5.0 Top Rated</span>
              </div>

              {/* Floating Badge Card 2 */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '15px',
                background: '#FFFFFF',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-teal)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>100% Verified Talent</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Over 10,000+ Completed Jobs</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

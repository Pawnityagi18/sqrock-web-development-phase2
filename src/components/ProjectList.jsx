import React, { useState } from 'react';
import { Filter, DollarSign, Clock, MapPin, CheckCircle2, Bookmark, Send, Sparkles, AlertCircle, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function ProjectList({ 
  projects, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  budgetRange,
  setBudgetRange,
  urgencyFilter,
  setUrgencyFilter,
  sortBy,
  setSortBy,
  savedProjects,
  onToggleSaveProject,
  onSelectProject
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section style={{ padding: '3.5rem 0' }}>
      <div className="container">
        
        {/* Section Header & Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Available Projects & Jobs ({projects.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Explore active job postings from verified clients worldwide
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="latest" style={{ background: '#111726' }}>Latest Postings</option>
                <option value="budget-high" style={{ background: '#111726' }}>Highest Budget</option>
                <option value="budget-low" style={{ background: '#111726' }}>Lowest Budget</option>
                <option value="proposals" style={{ background: '#111726' }}>Most Proposals</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'none' }}
            >
              <Filter size={15} /> Filters
            </button>

          </div>
        </div>

        {/* Main Content Layout (Sidebar + Card Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          
          {/* Exertio Left Filter Sidebar */}
          <aside className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} color="var(--primary)" /> Filter Projects
              </h3>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setBudgetRange(10000);
                  setUrgencyFilter('all');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>

            {/* Search Keyword Filter */}
            <div className="form-group">
              <label className="form-label">Search Keyword</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/logo.jpg" 
                  alt="Search Logo"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    objectFit: 'cover'
                  }}
                />
                <input 
                  type="text"
                  placeholder="e.g. Next.js, Figma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Category Filter Dropdown */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Max Budget Range Slider */}
            <div className="form-group" style={{ margin: '1.25rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label">Max Budget ($)</label>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                  ${budgetRange.toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="10000" 
                step="500"
                value={budgetRange}
                onChange={(e) => setBudgetRange(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                <span>$500</span>
                <span>$10,000+</span>
              </div>
            </div>

            {/* Urgency Badge Filter */}
            <div className="form-group">
              <label className="form-label">Project Urgency</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                {[
                  { id: 'all', label: 'All Jobs' },
                  { id: 'Featured', label: '★ Featured Only' },
                  { id: 'Urgent', label: '⚡ Urgent Only' },
                  { id: 'Hot', label: '🔥 Hot Bids' }
                ].map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: urgencyFilter === item.id ? '#FFF' : 'var(--text-muted)' }}>
                    <input 
                      type="radio"
                      name="urgency"
                      checked={urgencyFilter === item.id}
                      onChange={() => setUrgencyFilter(item.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Project Cards List */}
          <div>
            {projects.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <AlertCircle size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No projects match your criteria</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try clearing filters or adjusting search parameters</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setBudgetRange(10000);
                    setUrgencyFilter('all');
                  }}
                  className="btn btn-primary"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {projects.map((proj) => {
                  const isSaved = savedProjects.includes(proj.id);

                  return (
                    <div 
                      key={proj.id} 
                      className="glass-card glass-card-hoverable"
                      style={{ padding: '1.5rem' }}
                    >
                      {/* Top Meta Line: Urgency Tag + Category + Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {proj.urgency === 'Featured' && <span className="badge badge-featured">★ Featured</span>}
                          {proj.urgency === 'Urgent' && <span className="badge badge-urgent">⚡ Urgent</span>}
                          {proj.urgency === 'Hot' && <span className="badge badge-hot">🔥 Hot</span>}
                          <span className="badge badge-category">{proj.categoryName}</span>
                        </div>

                        <button 
                          onClick={() => onToggleSaveProject(proj.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isSaved ? 'var(--accent-amber)' : 'var(--text-dim)',
                            transition: 'transform 0.2s ease'
                          }}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
                        >
                          <Bookmark size={20} fill={isSaved ? 'var(--accent-amber)' : 'none'} />
                        </button>
                      </div>

                      {/* Project Title */}
                      <h3 
                        onClick={() => onSelectProject(proj)}
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '0.75rem',
                          cursor: 'pointer',
                          color: '#FFFFFF',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                      >
                        {proj.title}
                      </h3>

                      {/* Project Brief Snippet */}
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {proj.description}
                      </p>

                      {/* Required Skills Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {proj.skills.map((skill, idx) => (
                          <span key={idx} className="skill-pill">{skill}</span>
                        ))}
                      </div>

                      {/* Card Bottom Meta (Client info + Budget + Proposal CTA) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        
                        {/* Client details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img 
                            src={proj.client.avatar} 
                            alt={proj.client.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {proj.client.name}
                              {proj.client.verified && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '0.5rem' }}>
                              <span>★ {proj.client.rating}</span> • <span>{proj.client.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Budget & Submissions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {proj.budgetType} Price
                            </div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                              ${proj.budget.toLocaleString()}{proj.budgetType === 'Hourly' ? '/hr' : ''}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Proposals</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{proj.proposalsCount} bids</div>
                          </div>

                          <button 
                            onClick={() => onSelectProject(proj)}
                            className="btn btn-primary btn-sm"
                          >
                            <Send size={14} /> Submit Proposal
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

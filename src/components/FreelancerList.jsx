import React, { useState } from 'react';
import { Star, CheckCircle2, MapPin, DollarSign, Award, Eye, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';

export default function FreelancerList({ freelancers, onSelectFreelancer }) {
  const [filterExpertise, setFilterExpertise] = useState('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('all');

  const filteredFreelancers = freelancers.filter(free => {
    if (filterExpertise !== 'all' && free.expertise !== filterExpertise) return false;
    if (selectedSkillFilter !== 'all' && !free.skills.includes(selectedSkillFilter)) return false;
    return true;
  });

  return (
    <section style={{ padding: '3.5rem 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Top-Rated Freelancers & Experts
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Pre-screened professionals ready to jump onto your project today
            </p>
          </div>

          {/* Quick Expertise Filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'Expert', 'Intermediate'].map(exp => (
              <button
                key={exp}
                onClick={() => setFilterExpertise(exp)}
                className={`btn btn-sm ${filterExpertise === exp ? 'btn-primary' : 'btn-secondary'}`}
              >
                {exp === 'all' ? 'All Expertise' : exp}
              </button>
            ))}
          </div>
        </div>

        {/* Freelancers Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredFreelancers.map((free) => (
            <div 
              key={free.id}
              className="glass-card glass-card-hoverable"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Header: Avatar + Online Badge + Verified */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={free.avatar} 
                      alt={free.name}
                      style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-medium)' }}
                    />
                    {free.online && (
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          border: '2px solid var(--bg-card)'
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {free.name}
                      {free.verified && <ShieldCheck size={16} color="var(--accent-emerald)" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {free.location}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '2px' }}>
                      <Star size={13} fill="var(--accent-amber)" /> {free.rating} ({free.reviewsCount} reviews)
                    </div>
                  </div>
                </div>

                {/* Professional Title */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.65rem', lineHeight: 1.3 }}>
                  {free.title}
                </h4>

                {/* Bio Snippet */}
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {free.bio}
                </p>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {free.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="skill-pill">{skill}</span>
                  ))}
                  {free.skills.length > 4 && (
                    <span className="skill-pill">+{free.skills.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Card Footer: Rate + Success Rate + CTA */}
              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                    ${free.hourlyRate}<span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>/hr</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {free.successRate}% Job Success
                  </div>
                </div>

                <button 
                  onClick={() => onSelectFreelancer(free)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} /> View Profile
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { Code, Palette, Smartphone, Cpu, FileText, TrendingUp, Server } from 'lucide-react';

const iconMap = {
  Code,
  Palette,
  Smartphone,
  Cpu,
  FileText,
  TrendingUp,
  Server
};

export default function CategoryGrid({ categories, selectedCategory, onSelectCategory }) {
  return (
    <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Popular Service Categories</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Explore top-demand skills and find domain experts for your project</p>
          </div>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => onSelectCategory('all')}
              className="btn btn-sm btn-secondary"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Code;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                className="glass-card glass-card-hoverable"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#FFFFFF' : 'var(--primary)'
                  }}>
                    <IconComponent size={22} />
                  </div>
                  <span className="badge badge-category">{cat.count} Jobs</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {cat.name}
                </h3>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Skills: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{cat.topSkill}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

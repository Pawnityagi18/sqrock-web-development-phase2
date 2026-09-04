import React, { useState } from 'react';
import { X, PlusCircle, Sparkles } from 'lucide-react';
import { apiGenerateProjectDescription } from '../api/client';

export default function PostProjectModal({ categories, onClose, onSubmitProject, currentUser }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'web-dev');
  const [budgetType, setBudgetType] = useState('Fixed');
  const [budget, setBudget] = useState(2500);
  const [deadline, setDeadline] = useState('2026-08-30');
  const [skillsInput, setSkillsInput] = useState('React.js, Node.js, Tailwind CSS');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Featured');
  const [generating, setGenerating] = useState(false);

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim() || title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!budget || budget <= 0) newErrors.budget = 'Please enter a valid budget';
    if (!description.trim() || description.length < 30) newErrors.description = 'Description must be at least 30 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedCategoryObj = categories.find(c => c.id === category);
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newProject = {
      id: `proj-${Date.now()}`,
      title,
      category,
      categoryName: selectedCategoryObj ? selectedCategoryObj.name : 'Web Development',
      budgetType,
      budget: Number(budget),
      minBudget: Math.round(budget * 0.8),
      maxBudget: Math.round(budget * 1.2),
      deadline,
      daysLeft: 20,
      proposalsCount: 0,
      status: 'Open',
      urgency,
      client: {
        name: currentUser?.name || 'You',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: currentUser?.rating || 5.0,
        totalSpent: 0,
        location: 'Not specified',
        verified: true
      },
      skills: skillsArray.length > 0 ? skillsArray : ['React', 'JavaScript'],
      description,
      deliverables: [
        'Complete source code repository',
        'Technical documentation & setup guide',
        'Responsive testing across devices'
      ],
      postedDate: 'Just now'
    };

    onSubmitProject(newProject);
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) { setErrors({ title: 'Add a project title first' }); return; }
    setGenerating(true); setErrors({});
    try {
      const categoryName = categories.find(c => c.id === category)?.name || category;
      const description = await apiGenerateProjectDescription({ title, category: categoryName, skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean), budget });
      setDescription(description);
    } catch (error) { setErrors({ description: error.message }); }
    finally { setGenerating(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={22} color="var(--primary)" /> Post a New Freelance Project
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Publish your job opportunity to over 28,000+ top verified freelancers</p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          
          <div style={{
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            color: 'var(--text-main)'
          }}>
            Posting as <strong>{currentUser?.name || 'You'}</strong> ({currentUser?.email})
          </div>

          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input 
              type="text"
              placeholder="e.g. Build a High-Performance SaaS Dashboard with React & Node.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
            {errors.title && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Badge</label>
              <select 
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="form-select"
              >
                <option value="Featured">★ Featured Job</option>
                <option value="Urgent">⚡ Urgent Requirement</option>
                <option value="Standard">Standard Listing</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Budget Type</label>
              <select 
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="form-select"
              >
                <option value="Fixed">Fixed Price ($)</option>
                <option value="Hourly">Hourly Rate ($/hr)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Budget Amount ($)</label>
              <input 
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="form-input"
                style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}
              />
              {errors.budget && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.budget}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Deadline Date</label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills (Comma separated)</label>
            <input 
              type="text"
              placeholder="React, Next.js, Stripe, Tailwind CSS"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><label className="form-label">Detailed Project Description & Scope</label><button type="button" onClick={handleGenerateDescription} disabled={generating} className="btn btn-secondary btn-sm"><Sparkles size={14} /> {generating ? 'Generating…' : 'Generate with AI'}</button></div>
            <textarea 
              rows={4}
              placeholder="Outline the project goals, key technical stack, expected deliverables, and any relevant criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
            {errors.description && <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>{errors.description}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              <PlusCircle size={18} /> Publish Project Now
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

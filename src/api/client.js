// WorkPulse Resilient API Client

const API_BASE_URL = 'http://localhost:5000/api';

export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
};

export const apiFetchProjects = async (fallbackData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.projects && data.projects.length > 0 ? data.projects : fallbackData;
  } catch (err) {
    console.warn('API unavailable, serving fallback projects data');
    return fallbackData;
  }
};

export const apiCreateProject = async (projectData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    const data = await res.json();
    return data.project || projectData;
  } catch (err) {
    console.warn('API unavailable, saving project locally');
    return projectData;
  }
};

export const apiFetchProposals = async (fallbackData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/proposals`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.proposals || fallbackData;
  } catch (err) {
    console.warn('API unavailable, serving fallback proposals');
    return fallbackData;
  }
};

export const apiSubmitProposal = async (proposalData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    });
    const data = await res.json();
    return data.proposal || proposalData;
  } catch (err) {
    console.warn('API unavailable, submitting proposal locally');
    return proposalData;
  }
};

// WorkPulse Resilient API Client with Strict Browser Safety

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    if (!res || !res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return data.status === 'OK';
  } catch {
    return false;
  }
};

export const apiFetchProjects = async (fallbackData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`).catch(() => null);
    if (!res || !res.ok) return fallbackData;
    const data = await res.json().catch(() => ({}));
    return data.projects && Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : fallbackData;
  } catch (err) {
    return fallbackData;
  }
};

export const apiCreateProject = async (projectData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    }).catch(() => null);
    if (!res || !res.ok) return projectData;
    const data = await res.json().catch(() => ({}));
    return data.project || projectData;
  } catch (err) {
    return projectData;
  }
};

export const apiFetchProposals = async (fallbackData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/proposals`).catch(() => null);
    if (!res || !res.ok) return fallbackData;
    const data = await res.json().catch(() => ({}));
    return data.proposals && Array.isArray(data.proposals) ? data.proposals : fallbackData;
  } catch (err) {
    return fallbackData;
  }
};

export const apiSubmitProposal = async (proposalData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    }).catch(() => null);
    if (!res || !res.ok) return proposalData;
    const data = await res.json().catch(() => ({}));
    return data.proposal || proposalData;
  } catch (err) {
    return proposalData;
  }
};

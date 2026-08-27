// WorkPulse Resilient API Client with JWT Auth & Protected Endpoints

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('workpulse_token');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('workpulse_token', token);
    } else {
      localStorage.removeItem('workpulse_token');
    }
  }
};

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

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

export const apiLogin = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  if (data.token) setAuthToken(data.token);
  return data;
};

export const apiSignup = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  if (data.token) setAuthToken(data.token);
  return data;
};

export const apiFetchMe = async () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(false)
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
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
      headers: getHeaders(),
      body: JSON.stringify(projectData)
    }).catch(() => null);
    if (!res || !res.ok) {
      const errData = res ? await res.json().catch(() => ({})) : {};
      throw new Error(errData.message || 'Failed to create project');
    }
    const data = await res.json().catch(() => ({}));
    return data.project || projectData;
  } catch (err) {
    throw err;
  }
};

export const apiFetchProposals = async (fallbackData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/proposals`, {
      headers: getHeaders(false)
    }).catch(() => null);
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
      headers: getHeaders(),
      body: JSON.stringify(proposalData)
    }).catch(() => null);
    if (!res || !res.ok) {
      const errData = res ? await res.json().catch(() => ({})) : {};
      throw new Error(errData.message || 'Failed to submit proposal');
    }
    const data = await res.json().catch(() => ({}));
    return data.proposal || proposalData;
  } catch (err) {
    throw err;
  }
};

export const apiAcceptProposal = async (proposalId) => {
  const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/accept`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to accept proposal');
  return data;
};

export const apiFetchContracts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts`, {
      headers: getHeaders(false)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.contracts || [];
  } catch {
    return [];
  }
};

export const apiFundMilestone = async (contractId, milestoneId) => {
  const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/fund`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Funding milestone failed');
  return data.contract;
};

export const apiSubmitMilestone = async (contractId, milestoneId, submissionNotes) => {
  const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ submissionNotes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Submitting work failed');
  return data.contract;
};

export const apiReleaseMilestone = async (contractId, milestoneId) => {
  const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/release`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Releasing payment failed');
  return data.contract;
};

export const apiFetchMessages = async (contractId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/messages/${contractId}`, {
      headers: getHeaders(false)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch {
    return [];
  }
};

export const apiSendMessage = async (contractId, content) => {
  const res = await fetch(`${API_BASE_URL}/messages/${contractId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send message');
  return data.message;
};

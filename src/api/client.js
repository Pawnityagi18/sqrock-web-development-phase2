// WorkPulse Resilient API Client with JWT Auth & Automatic Fallbacks

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

// Safe JSON fetch wrapper that gracefully handles non-JSON / HTML 404 responses
const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers ? res.headers.get('content-type') : '';
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    }
    return { ok: false, status: res.status, data: null, isHtmlResponse: true };
  } catch (err) {
    return { ok: false, status: 500, data: null, isNetworkError: true };
  }
};

export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    if (!res || !res.ok) return false;
    const contentType = res.headers ? res.headers.get('content-type') : '';
    if (!contentType || !contentType.includes('application/json')) return false;
    const data = await res.json().catch(() => ({}));
    return data.status === 'OK';
  } catch {
    return false;
  }
};

export const apiLogin = async (credentials) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });

  if (result.ok && result.data && result.data.success) {
    if (result.data.token) setAuthToken(result.data.token);
    return result.data;
  }

  if (result.data && result.data.message) {
    throw new Error(result.data.message);
  }

  // Fallback for static host / backend offline
  const fallbackUser = {
    _id: 'usr_' + Date.now(),
    name: credentials.email.split('@')[0].toUpperCase(),
    email: credentials.email,
    role: credentials.role || 'freelancer',
    avatar: credentials.role === 'client' 
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
  };
  setAuthToken('demo_jwt_token');
  return { success: true, user: fallbackUser, token: 'demo_jwt_token' };
};

export const apiSignup = async (userData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });

  if (result.ok && result.data && result.data.success) {
    if (result.data.token) setAuthToken(result.data.token);
    return result.data;
  }

  if (result.data && result.data.message) {
    throw new Error(result.data.message);
  }

  // Fallback for static host / backend offline
  const fallbackUser = {
    _id: 'usr_' + Date.now(),
    name: userData.name,
    email: userData.email,
    role: userData.role || 'freelancer',
    avatar: userData.role === 'client'
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };
  setAuthToken('demo_jwt_token');
  return { success: true, user: fallbackUser, token: 'demo_jwt_token' };
};

export const apiFetchMe = async () => {
  const token = getAuthToken();
  if (!token) return null;
  const result = await safeFetchJson(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(false)
  });
  if (result.ok && result.data && result.data.user) {
    return result.data.user;
  }
  return null;
};

export const apiFetchProjects = async (fallbackData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/projects`);
  if (result.ok && result.data && result.data.projects && Array.isArray(result.data.projects) && result.data.projects.length > 0) {
    return result.data.projects;
  }
  return fallbackData;
};

export const apiCreateProject = async (projectData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(projectData)
  });

  if (result.ok && result.data && result.data.project) {
    return result.data.project;
  }
  return {
    _id: 'proj_' + Date.now(),
    ...projectData,
    status: 'Open',
    createdAt: new Date().toISOString()
  };
};

export const apiFetchProposals = async (fallbackData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals`, {
    headers: getHeaders(false)
  });
  if (result.ok && result.data && result.data.proposals && Array.isArray(result.data.proposals)) {
    return result.data.proposals;
  }
  return fallbackData;
};

export const apiSubmitProposal = async (proposalData) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(proposalData)
  });

  if (result.ok && result.data && result.data.proposal) {
    return result.data.proposal;
  }
  return {
    _id: 'prop_' + Date.now(),
    ...proposalData,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
};

export const apiAcceptProposal = async (proposalId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals/${proposalId}/accept`, {
    method: 'POST',
    headers: getHeaders()
  });

  if (result.ok && result.data) {
    return result.data;
  }
  return { success: true, message: 'Proposal accepted locally' };
};

export const apiFetchContracts = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts`, {
    headers: getHeaders(false)
  });
  if (result.ok && result.data && result.data.contracts) {
    return result.data.contracts;
  }
  return [];
};

export const apiFundMilestone = async (contractId, milestoneId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/fund`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (result.ok && result.data && result.data.contract) {
    return result.data.contract;
  }
  throw new Error('Funding milestone failed');
};

export const apiSubmitMilestone = async (contractId, milestoneId, submissionNotes) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ submissionNotes })
  });
  if (result.ok && result.data && result.data.contract) {
    return result.data.contract;
  }
  throw new Error('Submitting work failed');
};

export const apiReleaseMilestone = async (contractId, milestoneId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/milestones/${milestoneId}/release`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (result.ok && result.data && result.data.contract) {
    return result.data.contract;
  }
  throw new Error('Releasing payment failed');
};

export const apiFetchMessages = async (contractId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/messages/${contractId}`, {
    headers: getHeaders(false)
  });
  if (result.ok && result.data && result.data.messages) {
    return result.data.messages;
  }
  return [];
};

export const apiSendMessage = async (contractId, content) => {
  const result = await safeFetchJson(`${API_BASE_URL}/messages/${contractId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  });
  if (result.ok && result.data && result.data.message) {
    return result.data.message;
  }
  return {
    _id: 'msg_' + Date.now(),
    contract: contractId,
    content,
    createdAt: new Date().toISOString()
  };
};

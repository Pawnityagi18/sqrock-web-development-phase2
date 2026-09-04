// WorkPulse Resilient API Client with JWT Auth & Automatic Fallbacks

// In production, the frontend (e.g. Vercel) and backend (e.g. Render) usually
// live on different domains, so a relative '/api' path would wrongly hit the
// frontend's own domain. Set VITE_API_URL in your deployment platform's env
// vars to the deployed backend's URL (e.g. https://workpulse-backend.onrender.com/api).
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api');

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

// Creates a Razorpay Order for a milestone. Returns order details the caller uses
// to open Razorpay's Checkout modal — this is a JS overlay, not a redirect.
export const apiFundMilestone = async (contractId, milestoneId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/contracts/${contractId}/milestones/${milestoneId}/checkout`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (result.ok && result.data && result.data.orderId) {
    return result.data; // { orderId, amount, currency, keyId }
  }
  throw new Error(result.data?.message || 'Starting checkout failed');
};

// Called right after Razorpay Checkout's success handler fires, with the three
// fields it returns. Verifies the payment signature server-side.
export const apiVerifyPayment = async (payload) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (result.ok && result.data?.success) return result.data;
  throw new Error(result.data?.message || 'Payment verification failed');
};

export const apiRejectProposal = async (proposalId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/proposals/${proposalId}/reject`, { method: 'POST', headers: getHeaders() });
  if (result.ok && result.data?.success) return result.data;
  throw new Error(result.data?.message || 'Could not reject proposal');
};

export const apiGenerateProjectDescription = async (details) => {
  const result = await safeFetchJson(`${API_BASE_URL}/ai/project-description`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(details) });
  if (result.ok && result.data?.description) return result.data.description;
  throw new Error(result.data?.message || 'Could not generate a description');
};

export const apiSearchProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') params.set(key, value);
  });
  const result = await safeFetchJson(`${API_BASE_URL}/projects?${params.toString()}`);
  if (result.ok && result.data?.projects) return result.data;
  throw new Error(result.data?.message || 'Could not load projects');
};

export const apiCancelMilestoneCheckout = async (contractId, milestoneId, orderId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/contracts/${contractId}/milestones/${milestoneId}/cancel-checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId })
  });
  if (result.ok && result.data?.contract) return result.data.contract;
  throw new Error(result.data?.message || 'Could not cancel the payment checkout');
};

// Creates the freelancer's Razorpay Route Linked Account from bank/business details
// they enter directly (no hosted onboarding redirect exists for Route, unlike Stripe).
export const apiStartPayoutOnboarding = async (details) => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/connect/onboarding`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(details)
  });
  if (result.ok) return result.data;
  throw new Error(result.data?.message || 'Could not create payout account');
};

export const apiGetPayoutStatus = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/payments/connect/status`, {
    headers: getHeaders(false)
  });
  return result.ok ? result.data : { onboardingComplete: false };
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

// ---- Notifications ----

export const apiFetchNotifications = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications`, { headers: getHeaders(false) });
  return result.ok ? result.data : { notifications: [], unreadCount: 0 };
};

export const apiMarkNotificationRead = async (id) => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(false)
  });
  return result.ok;
};

export const apiMarkAllNotificationsRead = async () => {
  const result = await safeFetchJson(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(false)
  });
  return result.ok;
};

// ---- Avatar upload ----

export const apiUploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = getAuthToken();
  const result = await safeFetchJson(`${API_BASE_URL}/uploads/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {}, // no Content-Type — browser sets multipart boundary
    body: formData
  });
  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Upload failed');
};

// ---- Reviews ----

export const apiSubmitReview = async (contractId, rating, comment) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ contractId, rating, comment })
  });
  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Could not submit review');
};

export const apiFetchUserReviews = async (userId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews/user/${userId}`, { headers: getHeaders(false) });
  return result.ok ? (result.data.reviews || []) : [];
};

export const apiCheckAlreadyReviewed = async (contractId) => {
  const result = await safeFetchJson(`${API_BASE_URL}/reviews/contract/${contractId}`, { headers: getHeaders(false) });
  return result.ok ? result.data.alreadyReviewed : false;
};

// ---- Password reset ----

export const apiForgotPassword = async (email) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  return result.ok ? result.data : { success: false, message: result.data?.message || 'Something went wrong.' };
};

export const apiResetPassword = async (token, password) => {
  const result = await safeFetchJson(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ token, password })
  });
  return result.ok ? result.data : { success: false, message: result.data?.message || 'Reset failed.' };
};

// ---- Contract dispute ----

export const apiRaiseDispute = async (contractId, reason) => {
  const result = await safeFetchJson(`${API_BASE_URL}/contracts/${contractId}/dispute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  });
  if (result.ok && result.data) return result.data;
  throw new Error(result.data?.message || 'Could not raise dispute');
};

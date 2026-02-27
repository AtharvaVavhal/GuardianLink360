import axios from 'axios';

// FIX: Default was http://localhost:5000 (ML service port), should be 5001 (Node server)
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('senior_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('senior_token');
      localStorage.removeItem('senior_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ─── Auth ─────────────────────────────────────────────────────── */

export const requestOTP = (phone) =>
  api.post('/api/auth/otp/request', { phone });

export const verifyOTP = (phone, otp) =>
  api.post('/api/auth/otp/verify', { phone, otp });

/* ─── Alerts ────────────────────────────────────────────────────── */

export const triggerPanic = (payload = {}) =>
  api.post('/api/alert/panic', payload);

export const getMyAlerts = () =>
  api.get('/api/alert/my');

/* ─── Verify Caller ─────────────────────────────────────────────── */
// FIX: Backend now accepts both { name, organization } and { callerName, callerDepartment }
// Sending name/organization to match VerifyCaller.jsx form fields
export const verifyCaller = (payload) =>
  api.post('/api/alert/verify-caller', payload);

/* ─── Scam Detection ────────────────────────────────────────────── */
// FIX: This endpoint now exists on the server
export const runScamCheck = (answers) =>
  api.post('/api/alert/scam-check', { answers });

/* ─── Dashboard ─────────────────────────────────────────────────── */
export const getProfile = () =>
  api.get('/api/auth/user/' + JSON.parse(localStorage.getItem('senior_user') || '{}').phone);

export default api;

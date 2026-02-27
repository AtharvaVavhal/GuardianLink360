import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with auth header injection
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("senior_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("senior_token");
      localStorage.removeItem("senior_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ─── Auth ─────────────────────────────────── */

/**
 * Request OTP to phone number
 * @param {string} phone - e.g. "+1234567890"
 */
export const requestOTP = (phone) =>
  api.post("/api/auth/otp/request", { phone });

/**
 * Verify OTP and get back JWT token
 * @param {string} phone
 * @param {string} otp
 */
export const verifyOTP = (phone, otp) =>
  api.post("/api/auth/otp/verify", { phone, otp });

/* ─── Alerts ────────────────────────────────── */

/**
 * Trigger a PANIC alert — most critical action in the app
 * @param {Object} payload - { location?, notes? }
 */
export const triggerPanic = (payload = {}) =>
  api.post("/api/alert/panic", payload);

/**
 * Fetch current user's recent alerts
 */
export const getMyAlerts = () => api.get("/api/alert/my");

/* ─── Verify Caller ─────────────────────────── */

/**
 * Verify if a phone number / entity is legitimate
 * @param {Object} payload - { phone?, name?, organization? }
 */
export const verifyCaller = (payload) =>
  api.post("/api/alert/verify-caller", payload);

/* ─── Scam Detection ────────────────────────── */

/**
 * Run scam checklist analysis via P4 ML service (proxied through P3)
 * @param {string[]} answers - Array of boolean/string answers to 5 questions
 */
export const runScamCheck = (answers) =>
  api.post("/api/alert/scam-check", { answers });

/* ─── Dashboard ─────────────────────────────── */

/**
 * Get senior's own profile & stats
 */
export const getProfile = () => api.get("/api/dashboard/senior/me");

export default api;

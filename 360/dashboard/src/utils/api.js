import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "https://guardianlink360.onrender.com";

const api = axios.create({ baseURL: BASE_URL, timeout: 10000, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("guardian_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("guardian_token");
      localStorage.removeItem("guardian_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const guardianLogin = (phone) => api.post("/api/auth/login", { phone });

// Dashboard
export const getDashboardData = () => api.get("/api/dashboard/guardian");
export const getSeniorsList = () => api.get("/api/dashboard/seniors");
export const getAlerts = (params) => api.get("/api/alert/my", { params });
export const getIncidents = () => api.get("/api/dashboard/incidents");
export const getIncidentById = (id) => api.get(`/api/dashboard/incidents/${id}`);

// Transaction
export const freezeTransaction = (payload) => api.post("/api/transaction/freeze", payload);
export const unfreezeTransaction = (payload) => api.post("/api/transaction/unfreeze", payload);

export default api;

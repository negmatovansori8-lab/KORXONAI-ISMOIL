import axios from "axios";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("oems_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = String(err.config?.url ?? "");
    const onLogin = url.includes("/auth/login") || (typeof window !== "undefined" && window.location.pathname.startsWith("/login"));
    if (err.response?.status === 401 && typeof window !== "undefined" && !onLogin) {
      localStorage.removeItem("oems_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

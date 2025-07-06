// src/utils/api.js
import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
});

// Interceptor for setting Content-Type and Authorization headers
api.interceptors.request.use((config) => {
  // Set Content-Type based on data type
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  // Dynamically set Authorization header from localStorage
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Ensure Authorization header is not sent if no token is present
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
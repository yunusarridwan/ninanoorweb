import axios from "axios";
import { toast } from "react-toastify"; // Import Toastify jika ingin notifikasi

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
});

// Interceptor untuk menyesuaikan headers sebelum request dikirim
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`; // Tambahkan token ke headers
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Interceptor untuk menangani response error 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token dari localStorage

      toast.error("Sesi telah berakhir, silakan login kembali"); // Notifikasi ke user

      window.location.href = "/login"; // Redirect ke halaman login
    }
    return Promise.reject(error);
  }
);

export default api;

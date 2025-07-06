// src/layouts/login.jsx
import { useState, useEffect } from "react"; // Import useEffect
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/utils/api";
import { isAuthenticated } from '../utils/auth'; // Import fungsi isAuthenticated
import { useNavigate } from 'react-router-dom'; // Import useNavigate dari react-router-dom

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Inisialisasi useNavigate

  // --- Bagian yang perlu ditambahkan: Pengecekan otentikasi saat komponen dimuat ---
  useEffect(() => {
    console.log("Login.jsx - useEffect: Checking authentication status...");
    if (isAuthenticated()) {
      console.log("Login.jsx - useEffect: User is already authenticated. Redirecting to dashboard.");
      navigate("/"); // Arahkan ke halaman utama dashboard jika sudah login
    }
  }, [navigate]); // Tambahkan navigate sebagai dependency

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/user/admin-login", { email, password });

      if (response.data.success) {
        const receivedToken = response.data.token; // Asumsi token ada di response.data.token

        if (receivedToken) { // Penting: Pastikan receivedToken tidak kosong
          setToken(receivedToken); // Panggil setToken dari App.js
          toast.success("Login berhasil!");
          // Ini akan menyebabkan reload penuh, yang akan memicu App.js membaca localStorage lagi.
          // window.location.href = "/"; // Anda bisa tetap menggunakan ini jika ingin full reload
          navigate("/"); // Atau gunakan navigate untuk navigasi client-side
        } else {
          // --- LOGGING POINT 4: Jika backend sukses tapi tidak ada token ---
          console.warn("Login.jsx: Backend melaporkan sukses, tetapi tidak ada 'token' di response.data.token.");
          toast.error("Login berhasil, namun token tidak ditemukan. Mohon hubungi administrator.");
        }
      } else {
        toast.error(response.data.message || "Login gagal. Periksa kembali email dan password Anda.");
      }
    } catch (error) {
      // --- LOGGING POINT 5: Error saat panggilan API ---
      console.error("Login.jsx: Login gagal. Detail Error:", error.response?.data || error.message || error);
      toast.error(error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      // Perbaikan: Pastikan loading diatur ke false pada akhirnya, terlepas dari sukses/gagal
      setLoading(false); 
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 text-logo dark:text-white">Ninanoor Admin</h1>
        </div>
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div className="relative z-0 w-full group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="text-gray-500 dark:text-gray-400" size={20} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="email"
                className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Email Address
              </label>
            </div>
          </div>
          <div className="relative z-0 w-full group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="text-gray-500 dark:text-gray-400" size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full py-2.5 pl-10 pr-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Password
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary-600 hover:bg-primary-700 rounded-lg p-2.5 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams(); // Ambil token dari URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState(""); // State untuk konfirmasi password
  const [loading, setLoading] = useState(false); // State untuk loading button

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true saat submit

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/;
  
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be at least 6 characters, include a number, and can contain special characters (!@#$%^&*)");
      setLoading(false);
      return;
    }
    
    if (newPassword !== rePassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }
  
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password/${token}`, 
        { newPassword }
      );
  
      toast.success(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Selalu set loading false setelah selesai
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 p-4"> {/* Latar belakang abu-abu muda */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200" // Shadow lebih dalam, border halus
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center"> {/* Ukuran lebih besar, font lebih tebal, center */}
          Reset Password
        </h2>
        
        <div className="mb-4"> {/* Pembungkus untuk input */}
          <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">
            Password Baru
          </label>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition duration-200 ease-in-out" // Gaya input modern
          />
        </div>

        <div className="mb-6"> {/* Pembungkus untuk input */}
          <label htmlFor="rePassword" className="block text-gray-700 text-sm font-medium mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            id="rePassword"
            placeholder="Confirm your new password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition duration-200 ease-in-out" // Gaya input modern
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} // Disable button saat loading
          className={`w-full py-3 rounded-md font-semibold transition duration-300 ease-in-out ${
            loading ? 'bg-secondary cursor-not-allowed' : 'bg-secondary hover:bg-secondary text-white shadow-md hover:shadow-lg transform hover:scale-105'
          }`} // Gaya tombol modern dengan efek hover dan loading
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
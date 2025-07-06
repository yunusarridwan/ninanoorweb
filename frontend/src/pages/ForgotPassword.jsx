import { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = ({ closeModal }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Tambahkan state isLoading

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email cannot be empty!");
      return;
    }

    setIsLoading(true); // Mulai loading
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`,
        { email }
      );
      toast.success(data.message);
      closeModal(); // Tutup modal setelah berhasil
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false); // Hentikan loading setelah request selesai
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
        disabled={isLoading} // Nonaktifkan input saat loading
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        disabled={isLoading} // Mencegah tombol ditekan dua kali
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
};

// ✅ Validasi props dengan prop-types agar ESLint tidak error
ForgotPassword.propTypes = {
  closeModal: PropTypes.func.isRequired, // `closeModal` harus berupa fungsi dan wajib ada
};

export default ForgotPassword;

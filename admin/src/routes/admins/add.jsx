import { useState, useRef } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { Home, UserPlus } from "lucide-react"; // Import Home and UserPlus for consistency
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const AddAdmin = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telpn, setTelpn] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const telpnRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic validation and focus on input if there's an error
    if (!name) {
      toast.error("Please fill in Admin Name.");
      nameRef.current.focus();
      return;
    }
    if (!email) {
      toast.error("Please fill in Admin Email.");
      emailRef.current.focus();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current.focus();
      return;
    }
    if (!telpn) {
      toast.error("Please fill in Phone Number.");
      telpnRef.current.focus();
      return;
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(telpn)) {
      toast.error("Please enter a valid phone number format (e.g., +628123456789 or 08123456789).");
      telpnRef.current.focus();
      return;
    }

    if (!password) {
      toast.error("Please fill in Password.");
      passwordRef.current.focus();
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      passwordRef.current.focus();
      return;
    }
    if (!confirmPassword) {
      toast.error("Please confirm your Password.");
      confirmPasswordRef.current.focus();
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      confirmPasswordRef.current.focus();
      return;
    }

    try {
      const adminData = {
        name,
        email,
        telpn,
        password,
        role,
      };

      const response = await api.post("/api/admin/admins", adminData);

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setEmail("");
        setTelpn("");
        setPassword("");
        setConfirmPassword("");
        setRole("admin");
        navigate("/admins");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      const errorMessage = error.response?.data?.message || "Failed to add admin.";
      toast.error(errorMessage);

      if (errorMessage.includes("email already exists")) {
        emailRef.current.focus();
      } else if (errorMessage.includes("phone number already exists")) {
        telpnRef.current.focus();
      }
    }
  };

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Add Admin page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/admins">
          Admins
        </Breadcrumb.Item>
        <Breadcrumb.Item>Add Admin</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Tambah Admin Baru</h2>

      {/* Modern Card Container for the Form */}
      <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Nama Admin
            </label>
            <input
              ref={nameRef}
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              id="name"
              placeholder="Nama Lengkap Admin atau Username"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Admin Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Email Admin
            </label>
            <input
              ref={emailRef}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              id="email"
              placeholder="Alamat Email Admin"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Admin Phone Number */}
          <div>
            <label htmlFor="telpn" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Nomor Telepon
            </label>
            <input
              ref={telpnRef}
              onChange={(e) => setTelpn(e.target.value)}
              value={telpn}
              type="tel"
              id="telpn"
              placeholder="Nomor Telepon Admin"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Admin Role Selection */}
          <div>
            <label htmlFor="role" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Peran Admin
            </label>
            <select
              onChange={(e) => setRole(e.target.value)}
              value={role}
              id="role"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {/* Admin Password */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Password
            </label>
            <input
              ref={passwordRef}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
              placeholder="Masukkan Password"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Konfirmasi Password
            </label>
            <input
              ref={confirmPasswordRef}
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type="password"
              id="confirmPassword"
              placeholder="Konfirmasi Password"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Submit Button - span full width on small screens, center on large */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserPlus size={18} className="mr-2" /> Tambah Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
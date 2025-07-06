import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { isSuperAdmin } from "@/utils/auth"; // Import for checking user role
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { Home, UserCog } from "lucide-react"; // Import Home and UserCog icon
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const UpdateAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Use the theme hook

  // State for admin data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telpn, setTelpn] = useState("");
  const [password, setPassword] = useState(""); // New password (optional)
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm new password
  const [role, setRole] = useState(""); // Admin role, will be populated from fetched data

  // State for initial data loading status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for each input
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const telpnRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Check if the current user is a superadmin
  const currentUserIsSuperAdmin = isSuperAdmin();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get(`/api/admin/admins/${id}`);
        const admin = response.data.data;

        if (admin) {
          setName(admin.name);
          setEmail(admin.email);
          setTelpn(admin.telpn);
          setRole(admin.role); // Set the existing role from fetched data
        } else {
          toast.error("Admin data not found.");
          navigate("/admins");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.message || "Failed to fetch admin data");
        toast.error(err.response?.data?.message || "Failed to fetch admin data");
        navigate("/admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Input validation and focus on error
    if (!name) {
      toast.error("Admin Name cannot be empty.");
      nameRef.current.focus();
      return;
    }
    if (!email) {
      toast.error("Admin Email cannot be empty.");
      emailRef.current.focus();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current.focus();
      return;
    }
    if (!telpn) {
      toast.error("Phone Number cannot be empty.");
      telpnRef.current.focus();
      return;
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(telpn)) {
      toast.error("Please enter a valid phone number format (e.g., +628123456789 or 08123456789).");
      telpnRef.current.focus();
      return;
    }

    // Password validation if new password is provided
    if (password) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        passwordRef.current.focus();
        return;
      }
      if (password !== confirmPassword) {
        toast.error("New passwords do not match.");
        confirmPasswordRef.current.focus();
        return;
      }
    } else if (confirmPassword) { // If password is empty but confirmPassword is filled
      toast.error("Please enter a new password if you want to confirm it.");
      passwordRef.current.focus();
      return;
    }

    try {
      const adminData = {
        name,
        email,
        telpn,
      };

      // Add password only if it's not empty (meaning there's a change)
      if (password) {
        adminData.password = password;
      }

      // Send role only if the current user is a superadmin
      if (currentUserIsSuperAdmin) {
        adminData.role = role;
      }

      const response = await api.put(`/api/admin/admins/${id}`, adminData);

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/admins");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      const errorMessage = err.response?.data?.message || "Failed to update admin";
      toast.error(errorMessage);

      if (errorMessage.includes("Email already in use")) {
        emailRef.current.focus();
      } else if (errorMessage.includes("Phone number already in use")) {
        telpnRef.current.focus();
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col gap-y-4 p-6 text-center text-lg ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
        Memuat data admin...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col gap-y-4 p-6 text-center text-lg ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-500'}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Update Admin page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/admins">
          Admins
        </Breadcrumb.Item>
        <Breadcrumb.Item>Edit Admin</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Edit Admin</h2>

      {/* Modern Card Container for the Form */}
      <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Nama Admin
            </label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="tel"
              id="telpn"
              value={telpn}
              onChange={(e) => setTelpn(e.target.value)}
              placeholder="Nomor Telepon Admin"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              required
            />
          </div>

          {/* Admin Role Selection (Only shown if current user is superadmin) */}
          {currentUserIsSuperAdmin && (
            <div>
              <label htmlFor="role" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Peran Admin
              </label>
              <select
                id="role"
                onChange={(e) => setRole(e.target.value)}
                value={role}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                }`}
                required // Role is always required if this form field is rendered
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          )}

          {/* New Password (Optional) */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Password Baru (opsional)
            </label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Biarkan kosong untuk mempertahankan password lama"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Konfirmasi Password Baru
            </label>
            <input
              ref={confirmPasswordRef}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </div>

          {/* Submit Button - span full width on small screens, center on large */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserCog size={18} className="mr-2" /> Perbarui Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
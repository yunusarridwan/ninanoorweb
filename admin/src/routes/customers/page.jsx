import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api"; // Gunakan axios instance dengan interceptor
import UserOrderCount from "./UserOrderCount"; // Assuming this component exists and is styled
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb component
import { Home, Users } from "lucide-react"; // Import Home and Users icon
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const UserPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/user/all");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching user list:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch user list"
      );
      setUsers([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) => {
      const userName = user.name || user.username || "";
      const userEmail = user.email || "";

      return (
        userName.toLowerCase().includes(search.toLowerCase()) ||
        userEmail.toLowerCase().includes(search.toLowerCase())
      );
    }
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button key="1" onClick={() => handlePageChange(1)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis-start" className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis-end" className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>...</span>);
      }
      pageNumbers.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };


  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Users page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Users</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Pelanggan</h2>

      {/* Search Input Section (similar to Invoices/Admins) */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 flex justify-start ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to page 1 on search
          }}
          // --- PERBAIKAN DI SINI ---
          // Tambahkan bg-white untuk light mode secara eksplisit
          // Dan pastikan text-gray-900 juga di light mode
          className={`p-2 border rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' // Explicit light mode styling
            }`}
          // --- AKHIR PERBAIKAN ---
        />
      </div>

      {/* User List Table */}
      <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
            <tr>
              <th className={`w-1/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No</th>
              <th className={`w-2/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Username</th>
              <th className={`w-2/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
              <th className={`w-2/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No Telepon</th>
              <th className={`w-5/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Jumlah Order</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr key={user._id} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {(currentPage - 1) * usersPerPage + index + 1}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{user.username}</td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{user.email}</td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{user.telpn || 'N/A'}</td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    <UserOrderCount userId={user._id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={`px-4 py-4 text-center text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tidak ada pelanggan ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded disabled:opacity-50 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {renderPageNumbers()}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded disabled:opacity-50 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPage;
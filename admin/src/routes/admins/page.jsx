import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api"; // Gunakan axios instance dengan interceptor
import { Pencil, Trash2, UserPlus, Home } from "lucide-react";
import { Breadcrumb } from "flowbite-react";
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const AdminsPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchAdminsList = async () => {
    try {
      const response = await api.get("/api/admin/admins");
      console.log("API Response Data:", response.data);
      const fetchedAdmins = response.data.data || [];
      console.log("Fetched Admins (after .data.data):", fetchedAdmins);
      setList(fetchedAdmins);
    } catch (error) {
      console.error("Error fetching admin list:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch admin list"
      );
      setList([]);
    }
  };

  useEffect(() => {
    fetchAdminsList();
  }, []);

  const handleEditAdmin = (admin) => {
    navigate(`/admins/update/${admin._id}`);
  };

  const handleAddAdmin = () => {
    navigate("/admins/add");
  };

  const filteredList = Array.isArray(list)
    ? list.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          (item.telpn &&
            String(item.telpn).toLowerCase().includes(search.toLowerCase())) ||
          (item.role && item.role.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  console.log("Current List state:", list);
  console.log("Current Search term:", search);
  console.log("Filtered List:", filteredList);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  console.log("Current Items for display:", currentItems);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <button key="1" onClick={() => paginate(1)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
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
          onClick={() => paginate(i)}
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
        <button key={totalPages} onClick={() => paginate(totalPages)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Admins page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Admins</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Admin</h2>

      {/* Filter and Add Admin Section (similar to InvoiceListPage) */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <input
            type="text"
            placeholder="Cari admin (nama, email, peran, atau telepon)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border p-2 rounded-md w-full sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300'
            }`}
          />
          <button
            onClick={handleAddAdmin}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <UserPlus size={18} /> <span>Tambah Admin</span>
          </button>
        </div>
      </div>

      {/* Admin List Table (similar to InvoiceListPage table structure) */}
      <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
            <tr>
              <th className={`w-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No</th>
              <th className={`w-1/6 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Name</th>
              <th className={`w-1/6 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
              <th className={`w-1/6 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No Telpon</th>
              <th className={`w-1/6 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
              <th className={`w-1/6 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Created At</th>
              <th className={`w-1/6 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
            {currentItems.length > 0 ? (
              currentItems.map((admin, index) => (
                <tr key={admin._id} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-x-4">
                      <p className="font-medium">{admin.name}</p>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    <p>{admin.email}</p>
                  </td>
                  <td className={`px-4 py-3 text-left text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{admin.telpn}</td>
                  <td className={`px-4 py-3 text-left text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{admin.role}</td>
                  <td className={`px-4 py-3 text-left text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-x-4">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="text-green-500 hover:text-green-700 transition-colors duration-200"
                      >
                        <Pencil size={16} />
                      </button>
                      {/* You might want a delete button here too, similar to what you had before */}
                      {/* <button
                        onClick={() => handleDeleteAdmin(admin._id)} // Assume you have a handleDeleteAdmin function
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={`px-4 py-4 text-center text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tidak ada admin ditemukan.
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
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded disabled:opacity-50 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Previous
          </button>
          <div className="flex gap-2">
            {renderPageNumbers()}
          </div>
          <button
            onClick={() => paginate(currentPage + 1)}
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

export default AdminsPage;
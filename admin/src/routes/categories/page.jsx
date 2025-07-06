// src/routes/categories/page.jsx (CategoriesPage)
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { PlusCircle, Pencil, Trash2, Home, Package } from "lucide-react"; // Import Home, Package icons
import { Breadcrumb } from "flowbite-react";
import { useTheme } from "@/hooks/use-theme";

const CategoriesPage = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Paginasi frontend
  const { theme } = useTheme(); // Use the theme hook

  // Menggunakan useCallback untuk fetchCategoriesList
  const fetchCategoriesList = useCallback(async () => {
    try {
      const response = await api.get("/api/categories"); 
      const fetchedCategories = response.data.data || []; 
      setList(fetchedCategories);
    } catch (error) {
      console.error("Error fetching category list:", error);
      toast.error(
        error.response?.data?.message || "Gagal memuat daftar kategori"
      );
      setList([]); 
    }
  }, []);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]); // Dependency ditambahkan

  const handleEditCategory = (category) => {
    navigate(`/categories/update/${category._id}`);
  };

  const handleAddCategory = () => {
    navigate("/categories/add");
  };

  const filteredList = Array.isArray(list) ? list.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.createdBy && item.createdBy.name && item.createdBy.name.toLowerCase().includes(search.toLowerCase())) || 
      (item.updatedBy && item.updatedBy.name && item.updatedBy.name.toLowerCase().includes(search.toLowerCase())) 
  ) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // Pagination render logic
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Number of visible page buttons
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
      <Breadcrumb aria-label="Category page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Categories</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Kategori</h2>

      {/* Filter and Add Category Section */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, deskripsi, pembuat, atau pengubah..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
          className={`p-2 border rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <PlusCircle size={18} /> <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories List Table */}
      <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
            <tr>
              <th className={`px-4 py-3 text-left w-[5%] text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No</th>
              <th className={`px-4 py-3 text-left w-[100px] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Gambar</th> 
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Nama</th>
              <th className={`px-4 py-3 text-left w-[30%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Deskripsi</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Dibuat Pada</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Dibuat Oleh</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Terakhir Diperbarui</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Diperbarui Oleh</th>
              <th className={`px-4 py-3 text-center w-1/6 text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aksi</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
            {currentItems.length > 0 ? (
              currentItems.map((category, index) => (
                <tr key={category._id} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-center align-top text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center text-xs text-gray-600">No Img</div>
                    )}
                  </td>
                  <td className={`px-4 py-3 align-top ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <p className="font-medium text-sm break-words">{category.name}</p>
                  </td>
                  <td className={`px-4 py-3 text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    <p className="line-clamp-3">{category.description || 'N/A'}</p>
                  </td>
                  <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {category.createdBy ? category.createdBy.name : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {category.updatedBy ? category.updatedBy.name : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    <div className="flex items-center justify-center gap-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-green-500 hover:text-green-700 p-1"
                        title="Edit Kategori"
                      >
                        <Pencil size={16} />
                      </button>                     
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={`px-4 py-4 text-center text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tidak ada kategori ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={`flex justify-center items-center gap-4 py-4 mt-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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

export default CategoriesPage;
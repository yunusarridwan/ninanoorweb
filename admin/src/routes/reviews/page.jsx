// src/pages/AdminReviewManagement.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { Eye, Check, X, RefreshCw, Star, Search, Home } from "lucide-react";
import DetailReview from "./detail";
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { useTheme } from "@/hooks/use-theme"; // Pastikan path ini benar

const AdminReviewManagement = () => {
  const { theme } = useTheme(); // Ambil tema dari hook
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5; // Define items per page for pagination

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/reviews/admin`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Error fetching review list for admin:", error);
      toast.error(
        error.response?.data?.message || "Gagal memuat daftar ulasan."
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/api/product");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products for dropdown:", error);
      toast.error("Gagal memuat daftar produk.");
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, [fetchReviews, fetchProducts]);

  const updateReviewStatus = async (id, newStatus) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin mengubah status ulasan ini menjadi ${
          newStatus === "approved" ? "disetujui" : "ditolak"
        }?`
      )
    ) {
      return;
    }
    try {
      const response = await api.put(`/api/reviews/admin/${id}/status`, {
        status: newStatus,
      });
      toast.success(response.data.message);
      fetchReviews(); // Refresh data after update
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error(
        error.response?.data?.message || "Gagal memperbarui status ulasan."
      );
    }
  };

  // Helper untuk badge status
  const getStatusBadge = (status) => {
    let colorClass = "";
    let text = "";
    switch (status) {
      case "pending":
        colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
        text = "Pending";
        break;
      case "approved":
        colorClass = "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
        text = "Disetujui";
        break;
      case "rejected":
        colorClass = "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
        text = "Ditolak";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        text = "Tidak Diketahui";
        break;
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  // Helper untuk rating bintang
  const getStarRating = (rating) => {
    const stars = [];
    const numericRating =
      typeof rating === "number" && !isNaN(rating) ? rating : 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < numericRating ? "currentColor" : "none"}
          className={i < numericRating ? "text-yellow-400" : "text-gray-300"}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
  ];

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setSelectedProduct("");
    setCurrentPage(1);
  };

  // Filter and Pagination Logic using useMemo
  const { paginated: displayReviews, totalPages } = useMemo(() => {
    let tempReviews = [...reviews];

    // Apply search filter
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      tempReviews = tempReviews.filter(
        (review) =>
          (String(review.comment || "")
            .toLowerCase()
            .includes(lowercasedSearch) ||
            (review.userId &&
              String(review.userId.username || "")
                .toLowerCase()
                .includes(lowercasedSearch)) ||
            (review.productId &&
              String(review.productId.name || "")
                .toLowerCase()
                .includes(lowercasedSearch)))
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      tempReviews = tempReviews.filter(
        (review) => review.status === filterStatus
      );
    }

    // Apply product filter
    if (selectedProduct !== "") {
      tempReviews = tempReviews.filter(
        (review) => review.productId?._id === selectedProduct
      );
    }

    // Pagination
    const totalFiltered = tempReviews.length;
    const calculatedTotalPages = Math.ceil(totalFiltered / reviewsPerPage);
    const indexOfLast = currentPage * reviewsPerPage;
    const indexOfFirst = indexOfLast - reviewsPerPage;
    const paginated = tempReviews.slice(indexOfFirst, indexOfLast);

    return { paginated, totalFiltered, totalPages: calculatedTotalPages };
  }, [reviews, search, filterStatus, selectedProduct, currentPage, reviewsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page when search changes
  };

  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset page when filter changes
  };

  const handleProductFilterChange = (e) => {
    setSelectedProduct(e.target.value);
    setCurrentPage(1); // Reset page when product filter changes
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
      <Breadcrumb aria-label="Review management breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Review Management</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Manajemen Ulasan Pengguna</h2>

      {/* Filter and Search Section */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari komentar, nama produk, atau pengguna..."
              value={search}
              onChange={handleSearchChange}
              className={`p-2 pl-10 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Product Filter Dropdown */}
          <select
            value={selectedProduct}
            onChange={handleProductFilterChange}
            className={`p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Semua Produk</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>

          {/* Reset Filter Button */}
          <button
            onClick={resetFilters}
            className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center justify-center gap-x-2 w-full ${
              theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RefreshCw size={16} /> Reset Filter
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${filterStatus === option.value
                  ? "bg-teal-600 text-white shadow"
                  : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Review Modal */}
      {selectedReview && (
        <DetailReview
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      {/* Reviews List Table */}
      <div className={`overflow-x-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
            <tr>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg w-[3%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>ID Order</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[15%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Produk</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[15%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pengguna</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[7%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Rating</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[20%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Komentar</th> {/* Adjusted width for comment */}
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal</th>
              <th className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg w-[10%] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aksi</th> {/* Adjusted width for action */}
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
            {loading ? (
              <tr>
                <td colSpan="9" className={`text-center py-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Memuat ulasan...
                </td>
              </tr>
            ) : (
              displayReviews.length > 0 ? (
                displayReviews.map((review, index) => (
                  <tr key={String(review._id)} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                    <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      {(currentPage - 1) * reviewsPerPage + index + 1}
                    </td>
                    <td className={`px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {String(review.orderId?._id || "N/A")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-x-3">
                        <img
                          src={
                            review.productId?.image ||
                            "https://via.placeholder.com/50"
                          }
                          alt={String(review.productId?.name || "N/A")}
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-gray-200"
                        />
                        <p className={`text-sm font-medium line-clamp-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                          {String(review.productId?.name || "Produk Dihapus")}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {String(review.userId?.username || "Pengguna Dihapus")}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {String(review.userId?.email || "N/A")}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {getStarRating(review.rating)}
                    </td>
                    {/* MODIFIED: Shorten comment text even more */}
                    <td className={`px-3 py-2 text-sm max-w-[100px] truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {String(review.comment)}
                    </td>
                    {/* END MODIFIED */}
                    <td className="px-3 py-2 text-sm">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {String(
                        new Date(review.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-x-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition duration-200"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        {String(review.status) === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateReviewStatus(review._id, "approved")
                              }
                              className="text-green-600 hover:text-green-800 p-2 rounded-full bg-green-100 hover:bg-green-200 transition duration-200"
                              title="Setujui Ulasan"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateReviewStatus(review._id, "rejected")
                              }
                              className="text-red-600 hover:text-red-800 p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-200"
                              title="Tolak Ulasan"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className={`text-center py-10 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Tidak ada ulasan ditemukan.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={`flex justify-center items-center gap-4 py-4 mt-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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

export default AdminReviewManagement;
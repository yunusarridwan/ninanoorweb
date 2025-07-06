// src/components/OrdersPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { Eye, Home, Search, Calendar, RefreshCw } from "lucide-react"; // Import ikon tambahan
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { useTheme } from "@/hooks/use-theme"; // Pastikan path ini benar

const OrdersPage = () => {
  const { theme } = useTheme(); // Ambil tema dari hook
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [loading, setLoading] = useState(true);

  // State baru untuk filter
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const viewOrderDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Status map dengan warna latar belakang dan teks
  const statusMap = {
    "all": { label: "Semua", bg: "bg-gray-200", text: "text-gray-700" }, // Warna untuk tombol filter 'Semua'
    "Menunggu Pembayaran": { label: "Menunggu Pembayaran", bg: "bg-yellow-500", text: "text-white" },
    "Pembayaran Dikonfirmasi": { label: "Dikonfirmasi", bg: "bg-green-500", text: "text-white" },
    "Diproses": { label: "Diproses", bg: "bg-blue-500", text: "text-white" },
    "Dikirim": { label: "Dikirim", bg: "bg-indigo-500", text: "text-white" },
    "Selesai": { label: "Selesai", bg: "bg-gray-500", text: "text-white" },
    "Dibatalkan": { label: "Dibatalkan", bg: "bg-red-500", text: "text-white" },
  };

  // Function to determine the next allowed status
  const getNextAllowedStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "Menunggu Pembayaran":
        return ["Menunggu Pembayaran", "Pembayaran Dikonfirmasi", "Dibatalkan"]; // Allow confirming or canceling
      case "Pembayaran Dikonfirmasi":
        return ["Pembayaran Dikonfirmasi", "Diproses", "Dibatalkan"]; // Can process or cancel (include current status for selection)
      case "Diproses":
        return ["Diproses", "Dikirim", "Dibatalkan"]; // Can only ship (include current status for selection)
      case "Dikirim":
        return ["Dikirim", "Selesai"]; // Can only complete (include current status for selection)
      case "Selesai":
        return ["Selesai"]; // No further status changes, but allow selection of current
      case "Dibatalkan":
        return ["Dibatalkan"]; // No further status changes, but allow selection of current
      default:
        // Filter out 'all' status from options for individual orders
        return Object.keys(statusMap).filter(key => key !== 'all');
    }
  };

  // Fungsi untuk mengambil semua data pesanan dari backend
  const fetchAllOrdersRaw = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/order/all");
      if (response.data.success) {
        const sortedOrders = response.data.orders.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message || "Gagal mengambil daftar pesanan.");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching all orders raw:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Gagal mengambil daftar pesanan.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;
    const orderToUpdate = orders.find(order => order._id === orderId);

    // Cek apakah status baru valid berdasarkan status saat ini
    if (orderToUpdate) {
        const allowed = getNextAllowedStatuses(orderToUpdate.status);
        if (!allowed.includes(newStatus)) {
            toast.error(`Perubahan status dari "${orderToUpdate.status}" ke "${statusMap[newStatus]?.label || newStatus}" tidak diizinkan.`);
            return; // Hentikan proses jika tidak diizinkan
        }
    }
    
    try {
      const response = await api.patch(
        `/api/order/${orderId}/status`,
        { status: newStatus }
      );
      if (response.data.success) {
        toast.success("Status pesanan berhasil diperbarui!");
        await fetchAllOrdersRaw(); // Refresh data setelah update
      } else {
        toast.error(response.data.message || "Gagal memperbarui status pesanan.");
      }
    } catch (error) {
      console.error("Error updating order status:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat memperbarui status.");
    }
  };

  // Logika Filtering dan Pagination di Frontend
  const { paginated: displayOrders, totalPages } = useMemo(() => {
    let tempOrders = [...orders];

    // Apply search filter
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      tempOrders = tempOrders.filter((order) =>
        [order._id, order.userId?.username, order.status, order.paymentMethod]
          .join(" ")
          .toLowerCase()
          .includes(lowercasedSearch)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      tempOrders = tempOrders.filter((order) => order.status === filterStatus);
    }

    // Apply date filters
    if (startDate) {
      const start = new Date(startDate);
      tempOrders = tempOrders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inklusif sampai akhir hari
      tempOrders = tempOrders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate <= end;
      });
    }

    // Pagination
    const totalFiltered = tempOrders.length;
    const totalPages = Math.ceil(totalFiltered / ordersPerPage);
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const paginated = tempOrders.slice(indexOfFirst, indexOfLast);

    return { paginated, totalFiltered, totalPages };
  }, [orders, search, filterStatus, startDate, endDate, currentPage, ordersPerPage]);


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
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


  useEffect(() => {
    fetchAllOrdersRaw();
  }, [fetchAllOrdersRaw]);

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Orders page breadcrumb" className="mb-4">
          <Breadcrumb.Item href="/" icon={Home}>
              Home
          </Breadcrumb.Item>
          <Breadcrumb.Item>Orders</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Pesanan</h2>

      {/* Filter and Search Section */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari ID, pelanggan, atau pembayaran..."
              value={search}
              onChange={handleSearchChange}
              className={`p-2 pl-10 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>

          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full">
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className={`p-2 pr-2 pl-10 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    title="Tanggal Awal"
                />
                <Calendar size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="relative w-full">
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className={`p-2 pr-2 pl-10 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    title="Tanggal Akhir"
                />
                <Calendar size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>

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
          {Object.keys(statusMap).map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => handleStatusFilterChange(statusKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${filterStatus === statusKey
                  ? "bg-teal-600 text-white shadow" // Warna aktif lebih gelap
                  : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
                }`}
            >
              {statusMap[statusKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className={`overflow-x-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
            <tr>
              {/* Ukuran font header tabel diubah menjadi text-xs, padding px-3 */}
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Order ID</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Nama Pembeli</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Pesanan</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Pesanan</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Berat</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tanggal Pengiriman</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Banyak Produk</th>
              <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Detail</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
            {loading ? (
              <tr>
                <td colSpan="9" className={`text-center py-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Memuat pesanan...
                </td>
              </tr>
            ) : (
              displayOrders.length > 0 ? (
                displayOrders.map((order) => {
                  const currentStatusInfo = statusMap[order.status] || { bg: "bg-gray-400", text: "text-white" }; // Get current status colors
                  const allowedStatuses = getNextAllowedStatuses(order.status);
                  
                  return (
                    <tr key={order._id} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                      {/* Ukuran font body tabel diubah menjadi text-sm, padding px-3 */}
                      <td className={`px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {order._id}
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {order.userId?.username || 'N/A'}
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {new Date(order.orderDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {order.totalWeight} gram
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {order.items.length} items
                      </td>
                      <td className="px-3 py-2">
                        <select
                          onChange={(e) => statusHandler(e, order._id)}
                          value={order.status}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${currentStatusInfo.bg} ${currentStatusInfo.text} appearance-none border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50
                            ${theme === 'dark' ? 'dark:focus:ring-blue-400' : 'focus:ring-blue-300'}
                          `}
                        >
                          {/* Render only allowed next statuses, ensuring current status is always an option */}
                          {allowedStatuses.includes(order.status) ? 
                            allowedStatuses.map((statusOption) => (
                              <option key={statusOption} value={statusOption} className="text-black">
                                {statusMap[statusOption]?.label || statusOption}
                              </option>
                            ))
                            : // If current status is not in allowed (e.g. "Selesai" or "Dibatalkan"), just show current status
                            <option key={order.status} value={order.status} className="text-black">
                              {statusMap[order.status]?.label || order.status}
                            </option>
                          }
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => viewOrderDetail(order._id)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className={`text-center py-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada pesanan ditemukan.
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

export default OrdersPage;
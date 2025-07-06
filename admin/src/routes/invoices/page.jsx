import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import api from "@/utils/api";
import { toast } from "react-toastify";
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb component
import { Home } from "lucide-react"; // Import Home icon

const InvoiceListPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [invoices, setInvoices] = useState([]);
  const [displayedInvoices, setDisplayedInvoices] = useState([]);
  const [reportInvoices, setReportInvoices] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5);
  const [totalFilteredInvoices, setTotalFilteredInvoices] = useState(0);

  const paymentStatusOptions = {
    "all": { label: "Semua" },
    "Paid": { label: "Paid" },
    "Pending": { label: "Pending" },
  };

  const fetchAllInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/order/invoices/all");
      const data = Array.isArray(res.data.invoices) ? res.data.invoices : [];
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Gagal memuat daftar invoice.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllInvoices();
  }, [fetchAllInvoices]);

  useEffect(() => {
    let currentFilteredInvoices = [...invoices];

    if (searchTerm) {
      currentFilteredInvoices = currentFilteredInvoices.filter(
        (inv) =>
          inv._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inv.specificPaymentMethod && inv.specificPaymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inv.paymentStatus && inv.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== "all") {
      currentFilteredInvoices = currentFilteredInvoices.filter(
        (inv) => inv.paymentStatus === filterStatus
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      currentFilteredInvoices = currentFilteredInvoices.filter((invoice) => {
        const createdAt = new Date(invoice.createdAt);
        return createdAt.setHours(0, 0, 0, 0) >= start.setHours(0, 0, 0, 0);
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      currentFilteredInvoices = currentFilteredInvoices.filter((invoice) => {
        const createdAt = new Date(invoice.createdAt);
        return createdAt <= end;
      });
    }

    setTotalFilteredInvoices(currentFilteredInvoices.length);

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const paginatedInvoices = currentFilteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    setDisplayedInvoices(paginatedInvoices);
  }, [invoices, searchTerm, filterStatus, startDate, endDate, currentPage, invoicesPerPage]);

  const totalPages = Math.ceil(totalFilteredInvoices / invoicesPerPage);

  const formatTanggalIndonesia = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: 'h23'
    };
    return date.toLocaleString("id-ID", options);
  };

  const handleGenerateReport = () => {
    const filteredForReport = invoices.filter((invoice) => {
      const createdAt = new Date(invoice.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      return (!start || createdAt >= start) && (!end || createdAt <= end);
    });

    setReportInvoices(filteredForReport);
    setIsReportModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterClick = (status) => {
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
        <button key="1" onClick={() => handlePageChange(1)} className="px-3 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis-start" className="px-3 py-1 text-gray-500">...</span>);
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
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis-end" className="px-3 py-1 text-gray-500">...</span>);
      }
      pageNumbers.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  // Component for the report modal
  const ReportModal = ({ invoices, onClose, formatTanggal, startDate, endDate }) => {
    const handlePrint = () => {
      const originalTitle = document.title;
      document.title = 'Laporan Invoice Pemesanan';

      const printContentHtml = `
        <html>
          <head>
            <title>Laporan Invoice Pemesanan</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: 'Inter', sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
              th { background-color: #f8f8f8; }
              .text-center { text-align: center; }
              .text-left { text-align: left; }
              .text-2xl { font-size: 1.5rem; }
              .font-bold { font-weight: 700; }
              .mb-4 { margin-bottom: 1rem; }
              .p-6 { padding: 1.5rem; }
              .rounded-lg { border-radius: 0.5rem; }
              .overflow-hidden { overflow: hidden; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
              .text-gray-500 { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="p-6">
              <h3 class="text-2xl font-bold mb-4 text-center">LAPORAN INVOICE PEMESANAN</h3>
              <p class="text-center mb-4">
                Periode: ${startDate ? formatTanggal(startDate) : "Awal"} - ${endDate ? formatTanggal(endDate) : "Akhir"}
              </p>
              <div class="overflow-x-auto mb-6">
                <table class="min-w-full table-auto border rounded-lg overflow-hidden">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-3 py-2 border text-left">#</th>
                      <th class="px-3 py-2 border text-left">Invoice ID</th>
                      <th class="px-3 py-2 border text-left">Order ID</th>
                      <th class="px-3 py-2 border text-left">Tanggal</th>
                      <th class="px-3 py-2 border text-left">Metode</th>
                      <th class="px-3 py-2 border text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoices.length > 0 ?
                      invoices.map((inv, index) => `
                        <tr class="text-center">
                          <td class="border px-3 py-2">${index + 1}</td>
                          <td class="border px-3 py-2 text-left">${inv._id}</td>
                          <td class="border px-3 py-2 text-left">
                            ${inv.orderDetailId || "-"}
                          </td>
                          <td class="border px-3 py-2 text-left">
                            ${formatTanggal(inv.createdAt)}
                          </td>
                          <td class="border px-3 py-2 text-left">
                            ${inv.specificPaymentMethod || inv.paymentMethod || "-"}
                          </td>
                          <td class="border px-3 py-2 text-left">
                            ${inv.paymentStatus || "-"}
                          </td>
                        </tr>
                      `).join('')
                      : `
                        <tr>
                          <td colspan="6" class="text-center py-4 text-gray-500">
                            Tidak ada data laporan untuk periode ini.
                          </td>
                        </tr>
                      `}
                  </tbody>
                </table>
              </div>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(printContentHtml);
        printWindow.document.close();

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        console.error('Could not open print window. Pop-ups might be blocked.');
      }
      document.title = originalTitle;
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>

          <div id="report-content" className="p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">LAPORAN INVOICE PEMESANAN</h3>
            <p className="text-center mb-4">
              Periode: {startDate ? formatTanggal(startDate) : "Awal"} - {endDate ? formatTanggal(endDate) : "Akhir"}
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full table-auto border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 border text-left">No</th>
                    <th className="px-3 py-2 border text-left">Invoice ID</th>
                    <th className="px-3 py-2 border text-left">Order ID</th>
                    <th className="px-3 py-2 border text-left">Tanggal</th>
                    <th className="px-3 py-2 border text-left">Metode</th>
                    <th className="px-3 py-2 border text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((inv, index) => (
                      <tr key={inv._id} className="text-center border-b dark:border-gray-700">
                        <td className="border px-3 py-2 dark:border-gray-700">{index + 1}</td>
                        <td className="border px-3 py-2 text-left dark:border-gray-700">{inv._id}</td>
                        <td className="border px-3 py-2 text-left dark:border-gray-700">
                          {inv.orderDetailId || "-"}
                        </td>
                        <td className="border px-3 py-2 text-left dark:border-gray-700">
                          {formatTanggal(inv.createdAt)}
                        </td>
                        <td className="border px-3 py-2 text-left dark:border-gray-700">
                          {inv.specificPaymentMethod || inv.paymentMethod || "-"}
                        </td>
                        <td className="border px-3 py-2 text-left dark:border-gray-700">
                          {inv.paymentStatus || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-400">
                        Tidak ada data laporan untuk periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all duration-200"
              >
                Cetak Laporan
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 shadow-md transition-all duration-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Invoice page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Invoices</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Invoice</h2>

      {/* Filter Navigation */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Top row: Search and Status Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Cari invoice (ID, metode, status)"
            value={searchTerm}
            onChange={handleSearchChange}
            className={`border p-2 rounded-md w-full sm:w-2/5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300'}`}
          />
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-3/5 justify-end">
            {Object.keys(paymentStatusOptions).map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => handleStatusFilterClick(statusKey)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${filterStatus === statusKey
                    ? `bg-teal-500 text-white`
                    : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
                  }`}
              >
                {paymentStatusOptions[statusKey].label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom row: Date Filters and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
              title="Tanggal Awal"
            />
            <span className={`hidden sm:block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>hingga</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'}`}
              title="Tanggal Akhir"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-md transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4V3a1 1 0 011-1h8a1 1 0 011 1v1h1a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1zm5 2a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1zm3 0a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={handleResetFilters}
            className={`px-5 py-2 rounded-md shadow-md transition-all duration-200 w-full sm:w-auto ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table Invoice */}
      <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full table-auto border-collapse">
          <thead className={`border-b border-gray-200 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100'}`}>
            <tr>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>No</th>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>Invoice ID</th>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>Order Detail ID</th>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>Tgl. Dibuat</th>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>Metode Pembayaran</th>
              <th className={`px-4 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'}`}>Status Pembayaran</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100'}`}>
            {loading ? (
              <tr>
                <td colSpan="6" className={`text-center py-8 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Memuat invoice...
                </td>
              </tr>
            ) : (
              displayedInvoices.length > 0 ? (
                displayedInvoices.map((inv, index) => (
                  <tr key={inv._id} className={`hover:bg-gray-50 transition-colors duration-150 ${theme === 'dark' ? 'dark:hover:bg-gray-700' : ''}`}>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      {(currentPage - 1) * invoicesPerPage + index + 1}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-blue-600`}>
                      {inv._id}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-blue-600 align-top cursor-pointer hover:text-blue-800 ${theme === 'dark' ? 'dark:hover:text-blue-400' : ''}`}>
                      {inv.orderDetailId ? (
                        <Link
                          to={`/orders/${inv.mainOrderId}`}
                          className="hover:underline"
                        >
                          {inv.orderDetailId}
                        </Link>
                      ) : 'N/A'}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      {formatTanggalIndonesia(inv.createdAt)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      {inv.specificPaymentMethod}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                          inv.paymentStatus === "Paid"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`text-center py-8 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada invoice yang ditemukan.
                  </td>
                </tr>
              )
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

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          invoices={reportInvoices}
          onClose={() => setIsReportModalOpen(false)}
          formatTanggal={formatTanggalIndonesia}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
};

export default InvoiceListPage;
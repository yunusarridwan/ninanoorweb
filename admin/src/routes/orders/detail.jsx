// src/components/OrderDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { Home, ChevronRight, Copy } from "lucide-react"; // Import icon Copy dari Lucide React
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook
import { Breadcrumb, Button, Tooltip } from "flowbite-react"; // Import Breadcrumb, Button, dan Tooltip dari Flowbite

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Menggunakan useTheme hook

  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setLoading(false);
        setError("Order ID tidak ditemukan di URL.");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/order/${orderId}/no-invoice-details`);

        if (response.data.success) {
          setOrderDetail(response.data.order);
        } else {
          setError(response.data.message || "Gagal mengambil detail pesanan.");
          toast.error(response.data.message || "Gagal mengambil detail pesanan.");
        }
      } catch (err) {
        console.error("Error fetching order detail:", err);
        if (err.response && err.response.status === 401) {
          toast.error("Sesi Anda berakhir atau tidak sah. Silakan login kembali.");
          navigate("/login");
        } else {
          setError(err.message || "Terjadi kesalahan saat mengambil detail pesanan.");
          toast.error(err.message || "Terjadi kesalahan saat mengambil detail pesanan.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, navigate]);

  const formatIndoDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fungsi untuk menyalin Order ID ke clipboard
  const handleCopyOrderId = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Order ID berhasil disalin!");
    } catch (err) {
      console.error('Gagal menyalin Order ID:', err);
      toast.error("Gagal menyalin Order ID.");
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
        <p className="text-xl text-gray-600 dark:text-gray-300">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-10 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
        <p className="text-xl text-red-600">Terjadi kesalahan: {error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Kembali
        </button>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className={`text-center py-10 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
        <p className="text-xl text-gray-500 dark:text-gray-400">Detail pesanan tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb - Menggunakan komponen Flowbite Breadcrumb */}
      <Breadcrumb aria-label="Order detail page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/orders">
          Daftar Pesanan
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {`Detail Pesanan #${orderId}`}
        </Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <div className={`max-w-4xl mx-auto p-6 shadow-xl rounded-lg transition-all duration-300 ${theme === "dark" ? "bg-gray-800 text-gray-50" : "bg-white text-gray-800"}`}>
        {/* CATATAN PENTING: Jika ada scrollbar internal pada kotak ini, kemungkinan besar
            itu disebabkan oleh komponen layout parent yang membungkus OrderDetailPage
            (misalnya, div dengan 'height' tertentu dan 'overflow-y-auto').
            Komponen ini sendiri tidak menerapkan scrollbar internal.
        */}
        <h2 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 py-2">
          Detail Pesanan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-2 border-b pb-6 border-gray-200 dark:border-gray-700">
          {/* Info Umum */}
          <div>
            <h3 className="font-bold text-xl text-blue-500 mb-3">Informasi Umum</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2"> {/* Menggunakan flexbox untuk penataan Order ID dan tombol */}
                <strong>Order ID:</strong>{" "}
                <span className="font-mono text-purple-600 dark:text-purple-400">{orderDetail._id}</span>
                <Tooltip content="Salin Order ID" placement="right"> {/* Tooltip dari Flowbite */}
                  <Button
                    onClick={() => handleCopyOrderId(orderDetail._id)}
                    size="xs" // Ukuran tombol extra small
                    color="light" // Warna tombol light (sesuai dengan theme)
                    // Hapus kelas p-1, bg-gray-200, dll. karena Button Flowbite sudah memiliki stylenya sendiri
                  >
                    <Copy size={16} /> {/* Ikon copy dari Lucide React */}
                  </Button>
                </Tooltip>
              </p>
              <p>
                <strong>Tanggal Order:</strong> {formatIndoDate(orderDetail.orderDate || orderDetail.date)}</p>
              <p>
                <strong>Tanggal Pengiriman:</strong> {formatIndoDate(orderDetail.deliveryDate)}
              </p>
              <p>
                <strong>Status Pembayaran:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    orderDetail.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {orderDetail.paymentStatus || "Belum Bayar"}
                </span>
              </p>
               <p>
                <strong>Status Pengiriman:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    orderDetail.deliveryStatus === "Delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : orderDetail.deliveryStatus === "Shipped"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {orderDetail.deliveryStatus || "Belum Dikirim"}
                </span>
              </p>
            </div>
          </div>

          {/* Info Penerima */}
          <div>
            <h3 className="font-bold text-xl text-blue-500 mb-3">Informasi Penerima</h3>
            <div className="space-y-2">
              <p>
                <strong>Nama:</strong> {orderDetail.recipientName || "N/A"}
              </p>
              <p>
                <strong>Telepon:</strong> {orderDetail.address?.phone || orderDetail.recipientPhone || "N/A"}
              </p>
              <p>
                <strong>Alamat:</strong>{" "}
                {`${orderDetail.address?.street || "N/A"}, ${orderDetail.address?.village || "N/A"}, ${
                  orderDetail.address?.district || "N/A"
                }, ${orderDetail.address?.regency || "N/A"}, ${orderDetail.address?.province || "N/A"} ${
                  orderDetail.address?.zipcode || "N/A"
                }`}
              </p>
              <p>
                <strong>Catatan:</strong> {orderDetail.messageOrder || "-"}
              </p>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-xl text-blue-500 mb-2 border-t">Daftar Produk</h3>
        <div className="space-y-4">
          {orderDetail.items && orderDetail.items.length > 0 ? (
            orderDetail.items.map((item, index) => (
              <div key={index} className={`flex gap-3 items-center p-2 rounded-xl shadow-sm transition-all duration-300 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}>
                <img
                  src={item.image || "https://via.placeholder.com/64"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200 dark:border-gray-600"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-50 mb-0.5">{item.name} <span className="text-sm text-gray-600 dark:text-gray-300">({item.size})</span></p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-0.5">Jumlah: <span className="font-medium">{item.quantity}x</span></p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">Rp {item.totalPrice.toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic dark:text-gray-400">Tidak ada produk dalam pesanan ini.</p>
          )}
        </div>

        <div className="pt-6 border-t mt-6 space-y-3 text-right">
          <p className="text-sm">
            <strong>Subtotal Produk:</strong>{" "}
            <span className="font-semibold text-base text-blue-600 dark:text-blue-400">Rp {orderDetail.amount?.toLocaleString("id-ID") || "0"}</span>
          </p>
          <p className="text-sm">
            <strong>Ongkir:</strong>{" "}
            <span className="font-semibold text-base text-blue-600 dark:text-blue-400">Rp {orderDetail.shippingCost?.toLocaleString("id-ID") || "0"}</span>
          </p>
          <p className="text-xl font-bold mt-4 text-green-700 dark:text-green-300">
            Total Pembayaran: Rp {orderDetail.totalAmount?.toLocaleString("id-ID") || "0"}
          </p>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={() => navigate('/orders')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
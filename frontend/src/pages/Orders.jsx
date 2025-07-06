import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import Footer from "../components/Footer";
import api from "../context/api";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContextDef";

const Orders = () => {
    const { token, foods, fetchUserOrders, userOrders, userProductReviews, fetchUserReviews } = useContext(ShopContext);
    const navigate = useNavigate();

    // State untuk filter status
    const [filterStatus, setFilterStatus] = useState("Semua");
    // State untuk input pencarian
    const [searchTerm, setSearchTerm] = useState("");
    // State untuk filter tanggal
    const [startDate, setStartDate] = useState(""); // Format YYYY-MM-DD
    const [endDate, setEndDate] = useState("");   // Format YYYY-MM-DD

    const getStatusBadge = (status) => {
        let colorClass = "";
        let text = status;

        switch (status) {
            case "Pembayaran Dikonfirmasi":
                colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                break;
            case "Diproses":
                colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                break;
            case "Dikirim":
                colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
                break;
            case "Selesai":
                colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
                break;
            case "Menunggu Pembayaran":
            case "Dibatalkan":
                colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
                break;
            default:
                colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                text = "Menunggu Pembayaran";
        }

        return (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${colorClass}`}>
                {text}
            </span>
        );
    };

    const getProductImage = (productId) => {
        const product = foods.find((food) => food._id === productId);
        return product ? product.image : "https://via.placeholder.com/150";
    };

    const hasReviewed = (orderId, productId) => {
        return userProductReviews.some(
            (review) => {
                const reviewOrderId = String(review.orderId);
                const reviewProductId = String(review.productId?._id || review.productId);
                return reviewOrderId === orderId.toString() && reviewProductId === productId.toString();
            }
        );
    };

    const handlePayment = async (order) => {
        try {
            let savedToken = sessionStorage.getItem(`midtransToken_${order._id}`);
            let savedInvoiceId = sessionStorage.getItem(`midtransInvoiceId_${order._id}`);
            let savedMidtransTs = sessionStorage.getItem(`midtransTs_${order._id}`);


            if (savedToken && savedInvoiceId && savedMidtransTs) {
                console.log("Menggunakan token yang sudah ada:", savedToken);
                window.snap.pay(savedToken, snapCallbacks(order._id, savedInvoiceId, savedMidtransTs));
                return;
            }

            if (!order.orderDetailId || !order.totalAmount) {
                toast.error("Data pesanan tidak lengkap. Coba muat ulang halaman.");
                console.error("Order Detail ID atau Total Amount tidak ditemukan di objek order dari context.");
                return;
            }

            console.log("Mengirim orderDetailId ke backend:", order.orderDetailId);
            console.log("Mengirim totalAmount ke backend:", order.totalAmount);

            const response = await api.post("/api/order/midtrans/token", {
                orderDetailId: order.orderDetailId,
                totalAmount: order.totalAmount,
                paymentMethod: "Midtrans Snap",
                frontendRedirectUrl: window.location.origin + `/orders`,
            });

            if (response.data.token) {
                sessionStorage.setItem(`midtransToken_${order._id}`, response.data.token);
                if (!response.data.invoiceId || !response.data.midtransTs) {
                    toast.error("Data transaksi dari Midtrans tidak lengkap. Silakan coba lagi.");
                    console.error("Backend tidak mengembalikan invoiceId atau midtransTs yang baru.");
                    return;
                }
                sessionStorage.setItem(`midtransToken_${order._id}`, response.data.token);
                sessionStorage.setItem(`midtransInvoiceId_${order._id}`, response.data.invoiceId);
                sessionStorage.setItem(`midtransTs_${order._id}`, response.data.midtransTs);

                console.log("Token baru disimpan:", response.data.token);
                window.snap.pay(response.data.token, snapCallbacks(order._id, response.data.invoiceId, response.data.midtransTs));
            } else {
                toast.error("Gagal mendapatkan token pembayaran.");
            }
        } catch (error) {
            console.error("Error fetching Midtrans token:", error);
            toast.error("Terjadi kesalahan saat memproses pembayaran.");
        }
    };

    const snapCallbacks = (orderId, invoiceId, midtransTs) => ({
        onSuccess: async function (result) {
            console.log("Payment Success:", result);
            toast.success("Pembayaran berhasil!");
            console.log("snapCallbacks - onSuccess: Checking status for ->", { invoiceId, orderId, midtransTs });

            try {
                const checkStatusResponse = await api.post("/api/order/midtrans/check-status", {
                    invoiceId: invoiceId,
                    orderId: orderId,
                    midtransTs: midtransTs,
                });

                if (checkStatusResponse.data.success) {
                    toast.success("Status pembayaran diperbarui!");
                    fetchUserOrders();
                    fetchUserReviews();
                } else {
                    toast.error(checkStatusResponse.data.message || "Gagal memperbarui status pembayaran setelah berhasil!");
                }
            } catch (error) {
                console.error("Error checking status after success:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat memperbarui status pembayaran.");
            }

            try {
                const emailResponse = await api.post(`/api/order/send-invoice-email/${orderId}`);
                if (emailResponse.data.success) {
                    console.log("Invoice sent successfully!");
                    toast.success("Invoice berhasil dikirim ke email Anda.");
                } else {
                    toast.error(emailResponse.data.message || "Gagal mengirim invoice.");
                }
            } catch (error) {
                console.error("Error sending invoice:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat mengirim invoice.");
            }

            sessionStorage.removeItem(`midtransToken_${orderId}`);
            sessionStorage.removeItem(`midtransInvoiceId_${orderId}`);
            sessionStorage.removeItem(`midtransTs_${orderId}`);
        },
        onPending: async function (result) {
            console.log("Payment Pending:", result);
            toast.info("Menunggu pembayaran...");
            console.log("snapCallbacks - onPending: Checking status for ->", { invoiceId, orderId, midtransTs });

            try {
                await api.post("/api/order/midtrans/check-status", {
                    invoiceId: invoiceId,
                    orderId: orderId,
                    midtransTs: midtransTs,
                });
                fetchUserOrders();
            } catch (error) {
                console.error("Error checking status after pending:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat memperbarui status (Pending).");
            }
        },
        onError: async function (result) {
            console.log("Payment Error:", result);
            toast.error("Pembayaran gagal.");
            console.log("snapCallbacks - onError: Checking status for ->", { invoiceId, orderId, midtransTs });

            try {
                await api.post("/api/order/midtrans/check-status", {
                    invoiceId: invoiceId,
                    orderId: orderId,
                    midtransTs: midtransTs,
                });
                fetchUserOrders();
            } catch (error) {
                console.error("Error checking status after error:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat memperbarui status (Error).");
            }
            sessionStorage.removeItem(`midtransToken_${orderId}`);
            sessionStorage.removeItem(`midtransInvoiceId_${orderId}`);
            sessionStorage.removeItem(`midtransTs_${orderId}`);
        },
        onClose: function () {
            toast.warning("Anda menutup halaman pembayaran.");
            console.log("Pembayaran ditutup oleh pengguna.");
            sessionStorage.removeItem(`midtransToken_${orderId}`);
            sessionStorage.removeItem(`midtransInvoiceId_${orderId}`);
            sessionStorage.removeItem(`midtransTs_${orderId}`);
        },
    });

    useEffect(() => {
        if (token) {
            fetchUserOrders();
            fetchUserReviews();
        }
    }, [token, fetchUserOrders, fetchUserReviews]);

    // Daftar status yang tersedia untuk filter
    const statusOptions = [
        "Semua",
        "Menunggu Pembayaran",
        "Pembayaran Dikonfirmasi",
        "Diproses",
        "Dikirim",
        "Selesai",
        "Dibatalkan",
    ];

    // Fungsi untuk memfilter pesanan berdasarkan status, istilah pencarian, dan tanggal
    const filteredOrders = userOrders?.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const matchesStatus = filterStatus === "Semua" || order.status === filterStatus;
        const matchesSearchTerm = searchTerm === "" ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= new Date(end.setHours(23, 59, 59, 999))); // Set end time to end of day

        return matchesStatus && matchesSearchTerm && matchesDate;
    });

    return (
        <section className="max-padd-container mt-24">
            <div className="pt-6 pb-20">
                <Title title1="Daftar" title2="Transaksi" titleStyles="h3" />

                {/* Filter Section */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
                        {/* Search Input */}
                        <div className="relative flex-grow w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Cari transaksimu di sini"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* Date Range Picker */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                            <label htmlFor="startDate" className="sr-only">Tanggal Mulai</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="py-2 px-4 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Tanggal Mulai Transaksi"
                            />
                            <span className="text-gray-500 hidden sm:block">-</span> {/* Separator */}
                            <label htmlFor="endDate" className="sr-only">Tanggal Akhir</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="py-2 px-4 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Tanggal Akhir Transaksi"
                            />
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 w-full sm:w-auto"
                            >
                                Reset Tanggal
                            </button>
                        </div>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200
                                    ${filterStatus === status
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setFilterStatus("Semua");
                                setSearchTerm("");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                </div>


                {filteredOrders?.length === 0 ? (
                    <p className="text-center text-gray-600 mt-10">Tidak ada pesanan yang ditemukan dengan filter ini.</p>
                ) : (
                    filteredOrders?.map((order, orderIndex) => (
                        <div
                            key={`${order._id}-${orderIndex}`}
                            className="relative p-4 border rounded-lg shadow-md mb-4 bg-white"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h1 className="text-xl font-bold">Pesanan ID: {order._id}</h1>
                                    <h2 className="text-gray-600">
                                        Tanggal: {new Date(order.createdAt).toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h2>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-sm">
                                    {getStatusBadge(order.status)}
                                </span>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Item Produk</h3>
                                {order.items?.map((item, itemIndex) => (
                                    <div
                                        key={`${item.productId ? item.productId._id : item._id}-${itemIndex}`}
                                        className="p-2 border rounded-md mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                                    >
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <img
                                                src={getProductImage(item.productId ? item.productId._id : item._id)}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-md mr-4"
                                            />
                                            <div className="flex flex-col justify-center">
                                                <strong className="text-gray-800">{item.name}</strong>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item.quantity} | Ukuran: {item.size}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                                    Rp {item.totalPrice.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        {order.status === "Selesai" && !hasReviewed(order._id, item.productId ? item.productId._id : item._id) && (
                                            <button
                                                onClick={() =>
                                                    navigate(`/review/${order._id}/${item.productId ? item.productId._id : item._id}`)
                                                }
                                                className="btn bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full sm:w-auto text-sm md:text-base mt-2 sm:mt-0"
                                            >
                                                Beri Ulasan
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-col md:flex-row justify-between items-end md:items-center">
                                <p className="text-lg font-semibold text-right mb-4 md:mb-0">
                                    Total Belanja: Rp {order.totalAmount.toLocaleString('id-ID')}
                                </p>

                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    {order.status === "Menunggu Pembayaran" && (
                                        <button
                                            onClick={() => handlePayment(order)}
                                            className="btn bg-blue-500 text-white py-2 px-4 rounded w-full md:w-auto text-sm md:text-base"
                                            formTarget="_blank"
                                        >
                                            Bayar Sekarang
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/order-detail/${order._id}`)}
                                        className="btn bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 py-2 px-4 rounded w-full md:w-auto text-sm md:text-base"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Footer />
        </section>
    );
};

export default Orders;
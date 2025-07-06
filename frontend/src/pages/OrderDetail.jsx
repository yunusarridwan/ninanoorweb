// OrderDetail.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContextDef";
import { toast } from "react-toastify";
import api from "../context/api";
import Title from "../components/Title";
import Footer from "../components/Footer";
import Invoice from "../components/Invoice"; // Pastikan Invoice component bisa menerima invoiceData dengan format yang sudah diperbaiki

const OrderDetail = () => {
    const { orderId } = useParams();
    const { token, foods } = useContext(ShopContext); // foods mungkin masih diperlukan jika Anda ingin menampilkan info detail lain
    const [order, setOrder] = useState(null);
    const [invoiceDataForPrint, setInvoiceDataForPrint] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        const fetchOrderAndInvoiceDetail = async () => {
            setLoading(true);
            try {
                // 1. Ambil detail order
                const orderResponse = await api.get(`/api/order/${orderId}`);
                if (!orderResponse.data.success) {
                    toast.error("Gagal memuat detail pesanan.");
                    setLoading(false);
                    return;
                }
                const fetchedOrderData = orderResponse.data.order;
                setOrder(fetchedOrderData);

                const orderDetailId = fetchedOrderData.orderDetailId;

                const urlParams = new URLSearchParams(window.location.search);
                const redirectedInvoiceId = urlParams.get('invoiceId');
                const redirectedOrderId = urlParams.get('orderId');
                const midtransTs = urlParams.get('midtransTs'); // Ambil timestamp dari URL

                // 2. Panggil endpoint check-status jika user kembali dari Midtrans
                if (redirectedInvoiceId && redirectedOrderId && midtransTs && fetchedOrderData._id === redirectedOrderId) {
                    console.log("Redirected from Midtrans, checking transaction status...");
                    const checkStatusResponse = await api.post(
                        `/api/order/midtrans/check-status`,
                        { invoiceId: redirectedInvoiceId, orderId: redirectedOrderId, midtransTs: midtransTs }
                    );
                    if (checkStatusResponse.data.success) {
                        toast.success("Status pembayaran berhasil diperbarui!");
                        // Setelah update, refresh data order dan invoice dari API untuk mendapatkan status terbaru
                        const latestOrderResponse = await api.get(`/api/order/${orderId}`);
                        const latestFetchedOrderData = latestOrderResponse.data.order;
                        setOrder(latestFetchedOrderData);

                        const latestOrderDetailId = latestFetchedOrderData.orderDetailId;
                        if (latestOrderDetailId) {
                            const latestInvoiceResponse = await api.get(`/api/order/invoice/by-order-detail/${latestOrderDetailId}`);
                            if (latestInvoiceResponse.data.success) {
                                setInvoiceDataForPrint(latestInvoiceResponse.data.invoiceData);
                            }
                        }
                        navigate(`/order-detail/${orderId}`, { replace: true });

                    } else {
                        toast.error("Gagal memperbarui status pembayaran: " + checkStatusResponse.data.message);
                    }
                }

                // 3. Setelah potensi update status, baru ambil data invoice untuk ditampilkan
                if (orderDetailId) {
                    const invoiceResponse = await api.get(`/api/order/invoice/by-order-detail/${orderDetailId}`);
                    if (invoiceResponse.data.success) {
                        setInvoiceDataForPrint(invoiceResponse.data.invoiceData);
                    } else {
                        toast.warn("Invoice untuk pesanan ini belum tersedia.");
                    }
                } else {
                    toast.warn("ID Detail Order tidak ditemukan pada data pesanan.");
                }

            } catch (error) {
                console.error("Error fetching order detail:", error); // Log error lebih spesifik
                toast.error("Terjadi kesalahan saat memuat detail pesanan: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (token && orderId) {
            fetchOrderAndInvoiceDetail();
        }
    }, [token, orderId, navigate]); // Tambahkan navigate sebagai dependency jika digunakan di useEffect

    if (loading) {
        return (
            <section className="max-padd-container mt-24 min-h-screen flex items-center justify-center">
                <p>Memuat detail pesanan...</p>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="max-padd-container mt-24 min-h-screen flex items-center justify-center">
                <p>Detail pesanan tidak ditemukan.</p>
            </section>
        );
    }

    // Pastikan order.address sudah ada dan memiliki semua properti yang Anda butuhkan
    const displayAddress = order.formattedAddress || (order.address ?
        `${order.address.street || 'N/A'}, Kel. ${order.address.village || 'N/A'}, Kec. ${order.address.district || 'N/A'}, ${order.address.regency || 'N/A'}, Prov. ${order.address.province || 'N/A'}, Kode Pos ${order.address.zipcode || 'N/A'}`
        : 'Alamat tidak tersedia');

    return (
        <section className="max-padd-container mt-24 pb-20">
            <Title title1="Detail" title2="Pesanan" titleStyles="h3" />

            <div className="p-6 bg-white shadow-lg rounded-md border mt-4">
                <h2 className="text-xl font-bold mb-2">Pesanan ID: {order._id}</h2>
                <p className="text-gray-600 mb-1">
                    Tanggal Pemesanan: {new Date(order.orderDate).toLocaleDateString("id-ID")}
                </p>
                <p className="text-gray-600 mb-1">
                    Status Order: <strong>{order.status}</strong>
                </p>
                <p className="text-gray-600 mb-1">
                    Metode Pembayaran: {
                        invoiceDataForPrint?.metodePembayaran // Gunakan metode pembayaran dari invoiceDataForPrint
                        || order.paymentMethod // Fallback ke order.paymentMethod jika diperlukan (meskipun invoiceDataForPrint.metodePembayaran seharusnya sudah mencukupi)
                        || "-"
                    }
                </p>
                <p className="text-gray-600 mb-1">
                    Status Pembayaran: <strong className={invoiceDataForPrint?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}>
                        {invoiceDataForPrint?.paymentStatus || "Belum Ada Invoice"}
                    </strong>
                </p>
                <p className="text-gray-600 mb-1">
                    Tanggal Pengiriman: {new Date(order.deliveryDate).toLocaleDateString("id-ID") || "-"}
                </p>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Informasi Penerima</h3>
                    <p>Nama: {order.recipientName || 'N/A'}</p>
                    <p>Alamat: {displayAddress}</p> {/* Gunakan alamat yang sudah diformat */}
                    <p>No Telepon: {order.recipientPhone || 'N/A'}</p> {/* Perbaiki: Gunakan order.recipientPhone */}
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Daftar Produk</h3>
                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center border p-2 rounded mb-2"
                        >
                            {/* Gunakan item.image langsung dari data order, tidak perlu getProductImage */}
                            <img
                                src={item.image || "https://via.placeholder.com/150"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div className="flex justify-between w-full">
                                <div>
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Qantity: {item.quantity} | Size: {item.size || 'N/A'}                                        
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-800">
                                    Rp {item.totalPrice.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-right">
                    <p>Jumlah Total Barang: Rp {order.amount.toLocaleString()}</p>
                    <p>Biaya Pengiriman: Rp {order.shippingCost.toLocaleString()}</p>
                    <h4 className="text-lg font-bold mt-2">
                        Total: Rp {order.totalAmount.toLocaleString()}
                    </h4>
                </div>
            </div>

            <div className="flex justify-between mt-6 mb-8 no-print">
                <button
                    onClick={() => navigate("/orders")}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                    ← Riwayat Pesanan
                </button>

                <button
                    onClick={() => {
                        if (invoiceDataForPrint) {
                            setShowInvoice(true);
                            setTimeout(() => {
                                window.print();
                            }, 100);
                            const afterPrint = () => {
                                setShowInvoice(false);
                                window.removeEventListener("afterprint", afterPrint);
                            };
                            window.addEventListener("afterprint", afterPrint);
                        } else {
                            toast.info("Data invoice belum siap untuk dicetak. Mohon tunggu.");
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                    🧾 Print Invoice
                </button>
            </div>

            {showInvoice && invoiceDataForPrint && (
                <div id="invoice-print" className="hidden print:block">
                    <Invoice invoiceData={invoiceDataForPrint} />
                </div>
            )}

            <Footer />
        </section>
    );
};

export default OrderDetail;
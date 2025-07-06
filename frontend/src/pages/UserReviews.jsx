import { useEffect, useState, useContext } from 'react';
import api from '../context/api';
import { ShopContext } from '../context/ShopContextDef';
import Title from '../components/Title';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

const UserReviews = () => {
    const { token, foods } = useContext(ShopContext);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // State untuk filter
    const [filterProductId, setFilterProductId] = useState("Semua"); // ID produk yang dipilih untuk filter
    const [startDate, setStartDate] = useState(""); // Tanggal mulai untuk filter
    const [endDate, setEndDate] = useState("");     // Tanggal akhir untuk filter

    const getStarRating = (rating) => {
        const stars = [];
        const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
        for (let i = 0; i < 5; i++) {
            if (i < numericRating) {
                stars.push(<span key={i} className="text-yellow-400">★</span>);
            } else {
                stars.push(<span key={i} className="text-gray-300">★</span>);
            }
        }
        return <div className="flex">{stars}</div>;
    };

    const getProductImage = (productId) => {
        const product = foods.find((food) => food._id === productId);
        return product ? product.image : "https://via.placeholder.com/150";
    };

    const fetchMyReviews = async () => {
        setLoading(true);
        if (!token) {
            setMyReviews([]);
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/api/reviews/user-specific', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMyReviews(response.data.reviews);
            } else {
                console.error("Failed to fetch my reviews:", response.data.message);
                toast.error("Gagal memuat ulasan Anda.");
            }
        } catch (error) {
            console.error("Error fetching my reviews:", error);
            toast.error("Terjadi kesalahan saat memuat ulasan Anda.");
            if (error.response?.status === 401) {
                // Opsional: Redirect ke login jika token tidak valid
                // navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchMyReviews();
        }
    }, [token]); // Hapus foods dari dependencies karena foods dimuat di ShopContext, dan review tidak perlu trigger ulang fetch

    // Fungsi untuk memfilter ulasan berdasarkan produk dan tanggal
    const filteredReviews = myReviews.filter(review => {
        const reviewProductId = review.productId?._id || review.productId; // Ambil ID produk dari ulasan
        const reviewDate = new Date(review.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const matchesProduct = filterProductId === "Semua" || reviewProductId === filterProductId;
        const matchesDate = (!start || reviewDate >= start) && (!end || reviewDate <= new Date(end.setHours(23, 59, 59, 999)));

        return matchesProduct && matchesDate;
    });

    return (
        <section className="max-padd-container mt-24 pb-10">
            <Title title1="Riwayat" title2="Ulasan" titleStyles="h3 mb-6" />
            <div className="bg-white mb-10 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                {/* Filter Section */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    {/* Dropdown Filter Produk */}
                    <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor="productFilter" className="sr-only">Filter Produk</label>
                        <select
                            id="productFilter"
                            value={filterProductId}
                            onChange={(e) => setFilterProductId(e.target.value)}
                            className="py-2 px-4 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Semua">Semua Produk</option>
                            {foods.map((food) => (
                                <option key={food._id} value={food._id}>
                                    {food.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Picker */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                        <label htmlFor="startDateReview" className="sr-only">Tanggal Mulai Ulasan</label>
                        <input
                            type="date"
                            id="startDateReview"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="py-2 px-4 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Tanggal Mulai Ulasan"
                        />
                        <span className="text-gray-500 hidden sm:block">-</span>
                        <label htmlFor="endDateReview" className="sr-only">Tanggal Akhir Ulasan</label>
                        <input
                            type="date"
                            id="endDateReview"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="py-2 px-4 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Tanggal Akhir Ulasan"
                        />
                    </div>

                    {/* Reset Filter Button */}
                    <button
                        onClick={() => {
                            setFilterProductId("Semua");
                            setStartDate("");
                            setEndDate("");
                        }}
                        className="py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 w-full sm:w-auto"
                    >
                        Reset Filter
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-600">Memuat ulasan saya...</p>
                ) : filteredReviews.length === 0 ? (
                    <p className="text-center text-gray-600">Tidak ada ulasan yang ditemukan dengan filter ini.</p>
                ) : (
                    filteredReviews.map((review, index) => (
                        <div key={review._id} className="border-b last:border-b-0 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={getProductImage(review.productId?._id || review.productId)}
                                        alt={review.productId?.name || 'Produk'}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div>
                                        <p className="font-bold text-lg">{review.productId?.name || 'Produk Dihapus'}</p>
                                        <p className="text-sm text-gray-600">Pesanan ID: {review.orderId}</p>
                                    </div>
                                </div>
                                {getStarRating(review.rating)}
                            </div>
                            <p className="text-gray-800 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <Footer />
        </section>
    );
};

export default UserReviews;
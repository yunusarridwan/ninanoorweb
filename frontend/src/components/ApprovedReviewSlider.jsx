// src/components/ApprovedReviewsSlider.jsx

import { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules'; // Import modul yang diperlukan
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay'; // Jika menggunakan Autoplay
import api from '../context/api'; // Sesuaikan path ke api instance Anda
import { FaStar } from 'react-icons/fa'; // Untuk ikon bintang penuh
import { FaRegStar } from 'react-icons/fa'; // Untuk ikon bintang kosong
import Title from './Title';

const ApprovedReviewsSlider = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApprovedReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Panggil endpoint backend yang baru
            const response = await api.get('/api/reviews/approved?limit=10'); // Batasi 10 ulasan terbaru
            if (response.data.success) {
                setReviews(response.data.reviews);
            } else {
                setError(response.data.message || "Gagal memuat ulasan disetujui.");
            }
        } catch (err) {
            console.error("Error fetching approved reviews:", err);
            setError("Terjadi kesalahan saat memuat ulasan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApprovedReviews();
    }, [fetchApprovedReviews]);

    // Helper untuk menampilkan rating bintang
    const getStarRating = (rating) => {
        const stars = [];
        const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
        for (let i = 0; i < 5; i++) {
            if (i < numericRating) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-500" />); // Warna bintang kosong disesuaikan
            }
        }
        return <div className="flex gap-x-1">{stars}</div>; // Tambah gap-x untuk jarak antar bintang
    };

    if (loading) {
        return (
            <section className="text-white py-16 xl:py-20 text-center">
                <p>Memuat ulasan pelanggan...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="text-red-400 py-16 xl:py-20 text-center">
                <p>Error: {error}</p>
            </section>
        );
    }

    if (reviews.length === 0) {
        return (
            <section className="text-white py-16 xl:py-20 text-center">
                <p>Belum ada ulasan yang disetujui.</p>
            </section>
        );
    }

    return (
        <section className="py-16 xl:py-20"> {/* Sesuaikan warna latar belakang */}
            <div className="max-padd-container">
                 <Title title1={'Apa Kata'} title2={'Pelanggan Kami?'} titleStyles={'text-center !pb-20'} paraStyles={'!block'} />
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }} // Autoplay, sesuaikan delay
                    breakpoints={{
                        640: { // Mobile
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        768: { // Tablet
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        1024: { // Desktop
                            slidesPerView: 3,
                            spaceBetween: 40,
                        },
                    }}
                    className="mySwiper !pb-10" // Tambahkan !pb-10 agar pagination dots terlihat
                >
                    {reviews.map((review) => (
                        <SwiperSlide key={review._id}>
                            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center h-[300px]"> {/* Sesuaikan tinggi */}
                                <p className="text-black italic mb-4 flex-grow line-clamp-6"> {/* flex-grow agar teks komentar fleksibel */}
                                    &quot;{review.comment}&quot;
                                </p>
                                <div className="mb-4">
                                    {getStarRating(review.rating)}
                                </div>
                                <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-gray-600"> {/* Border untuk gambar */}
                                    {/* Gunakan gambar produk yang dipopulasi */}
                                    <img
                                        src={review.productId?.image || 'https://via.placeholder.com/100'}
                                        alt={review.productId?.name || 'Produk'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Anda bisa tambahkan detail lain di sini, misal "Produk: [Nama Produk]" */}
                                <p className="font-semibold text-black text-lg">{review.productId?.name}</p>
                                {/* Nama pengguna */}
                                <p className="text-black text-sm">{review.userId?.username || 'Pengguna Dihapus'}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default ApprovedReviewsSlider;
// src/components/DetailReview.jsx

import { Button, Modal } from "flowbite-react";
import PropTypes from 'prop-types';
import { Star, User, Package } from 'lucide-react'; // Import icons dari Lucide React
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const DetailReview = ({ review, onClose }) => {
    const { theme } = useTheme(); // Menggunakan useTheme hook untuk tema gelap/terang

    if (!review) {
        return null; // Jangan render modal jika tidak ada data ulasan
    }

    // Helper untuk menampilkan rating bintang dengan Lucide icons
    const getStarRating = (rating) => {
        const stars = [];
        const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
        for (let i = 0; i < 5; i++) {
            if (i < numericRating) {
                stars.push(<Star key={i} size={20} fill="currentColor" className="text-yellow-400" />);
            } else {
                stars.push(<Star key={i} size={20} className="text-gray-300 dark:text-gray-600" />);
            }
        }
        return <div className="flex gap-0.5">{stars}</div>;
    };

    // Fungsi utilitas untuk format tanggal & waktu Indonesia
    const formatDateTimeIndo = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        });
    };

    return (
        <Modal show={!!review} onClose={onClose} dismissible>
            <Modal.Header className={`${theme === 'dark' ? 'bg-gray-700 text-white border-b border-gray-600' : 'bg-white text-gray-900 border-b border-gray-200'}`}>
                Detail Ulasan
            </Modal.Header>
            <Modal.Body className={`${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}>
                <div className="space-y-4 p-4">
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>ID Ulasan:</strong> <span className="font-mono text-blue-600 dark:text-blue-400">{String(review._id || 'N/A')}</span>
                    </p>

                    <h4 className={`font-semibold text-lg mt-6 mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        <Package size={20} /> Informasi Produk:
                    </h4>
                    <div className={`flex items-center gap-4 p-3 rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                        <img
                            src={String(review.productId?.image || 'https://via.placeholder.com/100/A0B9DE/FFFFFF?text=Product')}
                            alt={String(review.productId?.name || 'Produk')}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-300 dark:border-gray-500"
                        />
                        <div className="space-y-1">
                            <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                <strong>Nama Produk:</strong> {String(review.productId?.name || 'Produk Dihapus')}
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <strong>ID Produk:</strong> <span className="font-mono">{String(review.productId?._id || 'N/A')}</span>
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <strong>ID Pesanan:</strong> <span className="font-mono">{String(review.orderId?._id || 'N/A')}</span>
                            </p>
                        </div>
                    </div>

                    <h4 className={`font-semibold text-lg mt-6 mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        <User size={20} /> Informasi Pengguna:
                    </h4>
                    <div className={`flex items-center gap-4 p-3 rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                        {/* Jika Anda memiliki avatar pengguna, bisa ditambahkan di sini */}
                        {/* <img src={String(review.userId?.avatar || 'https://via.placeholder.com/60')} alt="Avatar" className="w-16 h-16 rounded-full object-cover flex-shrink-0" /> */}
                        <div className="space-y-1">
                            <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                <strong>Nama Pengguna:</strong> {String(review.userId?.name || review.userId?.username || 'Pengguna Dihapus')}
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                <strong>Email Pengguna:</strong> {String(review.userId?.email || 'N/A')}
                            </p>
                        </div>
                    </div>

                    <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        <strong>Rating:</strong> {getStarRating(review.rating)}{' '}
                        <span className="font-bold">({String(review.rating || 'N/A')}/5)</span>
                    </p>
                    <div className="p-3 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                        <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            <strong>Komentar:</strong> {String(review.comment || 'Tidak ada komentar.')}
                        </p>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Status:</strong>{' '}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            review.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            review.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {String(review.status || 'N/A')}
                        </span>
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Tanggal Ulasan:</strong> {formatDateTimeIndo(review.createdAt)}
                    </p>
                    {review.updatedAt && String(new Date(review.createdAt).getTime()) !== String(new Date(review.updatedAt).getTime()) && (
                        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Terakhir Diperbarui:</strong> {formatDateTimeIndo(review.updatedAt)}
                        </p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer className={`${theme === 'dark' ? 'bg-gray-700 border-t border-gray-600' : 'bg-white border-t border-gray-200'}`}>
                <Button onClick={onClose} color={theme === 'dark' ? 'gray' : 'light'}>Tutup</Button>
            </Modal.Footer>
        </Modal>
    );
};

DetailReview.propTypes = {
    review: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        userId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                _id: PropTypes.string,
                name: PropTypes.string,
                username: PropTypes.string, // Tambahkan username jika mungkin ada
                email: PropTypes.string,
                avatar: PropTypes.string,
            }),
        ]),
        productId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                _id: PropTypes.string,
                name: PropTypes.string,
                image: PropTypes.string,
            }),
        ]),
        orderId: PropTypes.oneOfType([ // orderId bisa berupa string ID atau objek jika dipopulasi
            PropTypes.string,
            PropTypes.shape({
                _id: PropTypes.string,
                // tambahkan properti lain dari order jika dipopulasi
            }),
        ]),
        rating: PropTypes.number,
        comment: PropTypes.string,
        status: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
};

export default DetailReview;
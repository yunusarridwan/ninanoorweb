// src/pages/ReviewForm.jsx

import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Rating } from 'react-simple-star-rating';

import Title from "../components/Title";
import Footer from "../components/Footer";
import { ShopContext } from '../context/ShopContextDef';

const ReviewForm = () => {
    const { orderId, productId } = useParams();
    const navigate = useNavigate();
    const { submitReview, foods, userOrders, fetchUserOrders } = useContext(ShopContext);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [productToReview, setProductToReview] = useState(null);
    const [orderToReview, setOrderToReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadReviewData = async () => {
            setLoading(true);
            if (userOrders.length === 0) {
                await fetchUserOrders();
            }

            const currentOrder = userOrders.find(order => order._id === orderId);
            if (!currentOrder) {
                toast.error("Pesanan tidak ditemukan atau belum selesai.");
                navigate('/orders');
                setLoading(false);
                return;
            }

            const currentProduct = foods.find(food => food._id === productId);
            if (!currentProduct) {
                toast.error("Produk tidak ditemukan.");
                navigate(`/order-detail/${orderId}`);
                setLoading(false);
                return;
            }

            const isProductInOrder = currentOrder.items.some(item => (item.productId ? item.productId._id : item._id) === productId);
            if (!isProductInOrder) {
                toast.error("Produk ini bukan bagian dari pesanan Anda.");
                navigate(`/orders`);
                setLoading(false);
                return;
            }

            if (currentOrder.status !== 'Selesai') {
                toast.error("Anda hanya bisa mengulas produk dari pesanan yang sudah Selesai.");
                navigate(`/orders`);
                setLoading(false);
                return;
            }

            setOrderToReview(currentOrder);
            setProductToReview(currentProduct);
            setLoading(false);
        };

        if (orderId && productId && foods.length > 0) {
            loadReviewData();
        } else if (orderId && productId && userOrders.length === 0) {
            fetchUserOrders();
        }

    }, [orderId, productId, foods, userOrders, navigate, fetchUserOrders]);


    const handleRating = (rate) => {
        setRating(rate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Mohon berikan rating bintang.");
            return;
        }
        if (comment.trim().length < 10) {
            toast.error("Komentar minimal 10 karakter.");
            return;
        }

        setSubmitting(true);
        const reviewData = {
            productId: productToReview._id,
            orderId: orderToReview._id,
            rating: rating,
            comment: comment,
        };

        const res = await submitReview(reviewData); 
        setSubmitting(false);

        if (res.success) {
            navigate(`/orders`);
        }
    };

    if (loading) {
        return (
            <section className="max-padd-container mt-24 min-h-[500px] flex justify-center items-center">
                <p className="text-xl text-gray-700">Memuat formulir ulasan...</p>
            </section>
        );
    }

    if (!productToReview || !orderToReview) {
        return (
            <section className="max-padd-container mt-24 min-h-[500px] flex justify-center items-center">
                <p className="text-xl text-red-500">Gagal memuat detail ulasan. Pastikan URL benar dan pesanan valid.</p>
            </section>
        );
    }

    return (
        <section className="max-padd-container mt-24">
            <Title title1="Beri" title2="Ulasan" titleStyles="h3 mb-6" />
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl font-semibold mb-4">Ulas Produk: {productToReview.name}</h2>
                <div className="flex items-center gap-4 mb-6 p-4 border rounded-md">
                    <img
                        src={productToReview.image}
                        alt={productToReview.name}
                        className="w-24 h-24 object-cover rounded-md"
                    />
                    <div>
                        <p className="font-bold text-lg">{productToReview.name}</p>
                        <p className="text-gray-600">Pesanan ID: {orderToReview._id}</p>
                        <p className="text-gray-600">Tanggal Pesanan: {new Date(orderToReview.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Rating:</label>
                        <Rating
                            onClick={handleRating}
                            initialValue={rating}
                            size={35}
                            fillColor="#FFD700"
                            emptyColor="#ccc"
                            allowFraction={false}
                            className="flex"
                        />
                        {rating === 0 && <p className="text-red-500 text-xs mt-1">Mohon berikan rating bintang.</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Komentar:</label>
                        <textarea
                            id="comment"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y min-h-[100px]"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tulis ulasan Anda di sini..."
                            rows="4"
                            required
                        ></textarea>
                        {comment.trim().length < 10 && comment.length > 0 && <p className="text-red-500 text-xs mt-1">Komentar minimal 10 karakter.</p>}
                    </div>

                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                </form>
            </div>
            <Footer />
        </section>
    );
};

export default ReviewForm;
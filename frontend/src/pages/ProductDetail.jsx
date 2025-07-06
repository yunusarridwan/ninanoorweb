// src/pages/ProductDetail.jsx
import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import Footer from '../components/Footer';
import api from '../context/api';
import { Rating } from 'react-simple-star-rating';
import { ShopContext } from '../context/ShopContextDef';
import { Modal, Button } from 'flowbite-react';
// import { FaMinus, FaPlus } from 'react-icons/fa6'; // Tidak lagi dibutuhkan
import { TbShoppingBagPlus } from 'react-icons/tb'; // Icon shopping bag

const ProductDetail = () => {
    const { productId } = useParams();
    const { foods, addToCart } = useContext(ShopContext);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    // selectedQuantities dan fungsi terkait tidak lagi dibutuhkan
    // const [selectedQuantities, setSelectedQuantities] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            setLoading(true);
            try {
                const foundProduct = foods.find(f => f._id === productId);
                let currentProduct = null;

                if (foundProduct) {
                    currentProduct = foundProduct;
                } else {
                    const productRes = await api.get(`/api/product/${productId}`);
                    if (productRes.data.success && productRes.data.product) {
                        currentProduct = productRes.data.product;
                    } else {
                        toast.error("Produk tidak ditemukan.");
                        setLoading(false);
                        navigate('/products');
                        return;
                    }
                }

                if (currentProduct.status === 'nonactive') {
                    toast.warn("Produk ini tidak aktif dan tidak dapat dilihat.");
                    console.log(`ProductDetail: Redirecting, product ${productId} is nonactive.`);
                    navigate('/products');
                    setLoading(false);
                    return;
                }

                setProduct(currentProduct);

                const reviewsRes = await api.get(`/api/reviews/product/${productId}`);
                if (reviewsRes.data.success) {
                    setReviews(reviewsRes.data.reviews);
                } else {
                    toast.error("Gagal memuat ulasan produk.");
                }
            } catch (error) {
                console.error("Error fetching product details or reviews:", error);
                toast.error("Terjadi kesalahan saat memuat detail produk.");
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductAndReviews();
        }
    }, [productId, foods, navigate]);

    if (loading) {
        return (
            <section className="max-padd-container mt-24 min-h-[500px] flex justify-center items-center">
                <p className="text-xl text-gray-700">Memuat detail produk...</p>
            </section>
        );
    }

    if (!product) {
        return null;
    }

    const averageRating = product.averageRating || (reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0);
    const numberOfReviews = product.numberOfReviews || reviews.length;

    // Fungsi handleQuantityChangePerSize, calculateTotalAmount, dll. dihapus
    // karena penambahan ke keranjang sekarang per tombol ukuran

    // Fungsi baru untuk menambahkan satu item dengan ukuran spesifik
    const handleAddToCartBySize = (size) => {
        const quantityToAdd = 1; // Selalu tambahkan 1 item
        addToCart(product._id, size, quantityToAdd);
    };

    return (
        <section className="max-padd-container mt-24 pb-10">
            {/* Main Product Info Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 flex flex-wrap gap-8 justify-center md:justify-start">
                {/* Left Column: Product Image */}
                <div className="w-full sm:w-[45%] md:w-[30%] aspect-w-4 aspect-h-3 overflow-hidden rounded-md shadow-sm min-w-0">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Middle Column: Product Details */}
                <div className="w-full sm:w-[45%] md:w-[30%] flex flex-col justify-between min-w-0">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">{product.name}</h2>
                        <div className="flex items-center mb-4">
                            <Rating
                                initialValue={averageRating}
                                size={18}
                                fillColor="#FFD700"
                                emptyColor="#ccc"
                                readonly
                                className="mr-1"
                            />
                            <span className="text-gray-700 text-sm">({averageRating.toFixed(1)}) - {numberOfReviews} ulasan</span>
                        </div>

                        {/* Harga Range (jika ada multiple prices) atau harga tunggal */}
                        <p className="text-4xl font-bold text-gray-900 mb-6">
                            {product.prices && product.prices.length > 0
                                ? (product.prices.length === 1
                                    ? formatCurrency(product.prices[0].price)
                                    : `${formatCurrency(Math.min(...product.prices.map(p => p.price)))} - ${formatCurrency(Math.max(...product.prices.map(p => p.price)))}`
                                )
                                : "Harga Tidak Tersedia"}
                        </p>

                        {/* Deskripsi Produk */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Deskripsi Produk:</h3>
                            <div className="p-0 rounded-lg" id="detail" role="tabpanel" aria-labelledby="detail-tab">
                                <p className="text-gray-700 mb-3 text-base leading-relaxed">{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Controls - Revisi untuk Tombol Per Ukuran */}
                <div className="w-full sm:w-[80%] md:w-[30%] min-w-0">
                    <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Pilih Ukuran</h3>

                        {product.prices && product.prices.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {[...product.prices].sort((a, b) => {
                                    const order = ['H', 'F', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
                                    return order.indexOf(a.size) - order.indexOf(b.size);
                                }).map((p) => (
                                    <div key={p.size} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0">
                                        <span className="text-gray-700 text-base font-medium">
                                            {p.size} ({formatCurrency(p.price)})
                                        </span>
                                        <Button
                                            onClick={() => handleAddToCartBySize(p.size)}
                                            size="sm" // Ukuran tombol kecil
                                            className="px-3 py-1.5 rounded-md flex items-center gap-1 bg-secondary"
                                        >
                                            <TbShoppingBagPlus className='text-lg' />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mb-4">Tidak ada pilihan ukuran untuk produk ini.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section - Hanya menampilkan ringkasan dan tombol popup */}
            <div className="mt-8 mb-10">
                <Title title1="Ulasan" title2="Pelanggan" titleStyles="h3 mb-6" />

                {reviews.length === 0 ? (
                    <p className="text-center text-gray-600">Belum ada ulasan untuk produk ini.</p>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                        <p className="text-gray-700 text-lg">
                            Produk ini memiliki total <span className="font-bold">{numberOfReviews}</span> ulasan dengan rata-rata <span className="font-bold">{averageRating.toFixed(1)}</span> dari 5 bintang.
                        </p>
                        <Button onClick={() => setOpenModal(true)} color="blue" className="ml-4">
                            Lihat Semua Ulasan ({numberOfReviews})
                        </Button>
                    </div>
                )}
            </div>

            {/* Flowbite Modal (Popup) untuk Ulasan */}
            <Modal show={openModal} onClose={() => setOpenModal(false)} size="3xl">
                <Modal.Header>Ulasan untuk {product.name}</Modal.Header>
                <Modal.Body className="max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <strong className="text-gray-800 text-md mr-2">{review.userId?.username || 'Pengguna Anonim'}</strong>
                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="mb-2">
                                    <Rating
                                        initialValue={review.rating}
                                        size={18}
                                        fillColor="#FFD700"
                                        emptyColor="#ccc"
                                        readonly
                                    />
                                </div>
                                <p className="text-gray-700 italic text-sm leading-relaxed">&quot;{review.comment}&quot;</p>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>

            <Footer/>
        </section>
    );
};

export default ProductDetail;
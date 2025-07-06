// src/context/ShopContextDef.jsx
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from './api'; // Pastikan path ini benar
import PropTypes from 'prop-types'; // Import PropTypes

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const currency = 'Rp';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [foods, setFoods] = useState([]);
    const [token, setToken] = useState(() => localStorage.getItem("token") || '');
    const [items, setItems] = useState({}); // Akan tetap sebagai objek bersarang
    const [userOrders, setUserOrders] = useState([]); // Untuk menyimpan daftar pesanan user

    // --- TAMBAHAN BARU UNTUK ULASAN PENGGUNA ---
    const [userProductReviews, setUserProductReviews] = useState([]); // State baru untuk menyimpan ulasan yang sudah ada

    // --- Fungsi Pembantu (Helper Functions) ---
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken('');
        setItems({}); // Bersihkan keranjang saat logout
        setUserOrders([]); // Bersihkan pesanan saat logout
        // --- Hapus ulasan dari state saat logout ---
        setUserProductReviews([]); // Bersihkan ulasan saat logout
        navigate("/login");
    }, [navigate]);

    // ... (Fungsi addToCart, updateQuantity, removeFromCart tetap sama) ...

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error("Silahkan pilih ukuran produk terlebih dahulu.");
            return;
        }

        if (!token) {
            toast.error("Silahkan login untuk menambahkan produk ke keranjang.");
            navigate("/login");
            return;
        }

        let updatedItems = structuredClone(items);
        if (!updatedItems[itemId]) {
            updatedItems[itemId] = {};
        }
        updatedItems[itemId][size] = (updatedItems[itemId][size] || 0) + 1;
        setItems(updatedItems); // Update state optimistik

        try {
            await api.post("/api/cart/add", { productId: itemId, size: size, quantity: updatedItems[itemId][size] }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Produk berhasil ditambahkan");
        } catch (error) {
            console.error("Error adding to cart:", error);
            setItems(items); // Rollback state jika API gagal
            const errorMessage = error.response?.data?.message || "Gagal menambahkan produk, silahkan coba kembali!";
            toast.error(errorMessage);

            if (error.response?.status === 401) {
                toast.error("Session anda telah habis waktunya, silahkan login kembali");
                logout();
            }
        }
    };

    const updateQuantity = async (itemId, size, newQuantity) => {
        if (!token) {
            toast.error("SIlahkan login untuk melakukan perubahan pada keranjang");
            navigate("/login");
            return;
        }

        let updatedItems = structuredClone(items);
        if (!updatedItems[itemId]) {
            updatedItems[itemId] = {};
        }

        if (newQuantity <= 0) {
            delete updatedItems[itemId][size];
            if (Object.keys(updatedItems[itemId]).length === 0) {
                delete updatedItems[itemId];
            }
        } else {
            updatedItems[itemId][size] = newQuantity;
        }
        setItems(updatedItems);

        try {
            if (newQuantity > 0) {
                await api.put("/api/cart/update", { productId: itemId, size: size, quantity: newQuantity }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Jumlah produk berhasil dirubah");
            } else {
                await api.delete("/api/cart/remove", {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId: itemId, size: size }
                });
                toast.success("Produk berhasil di hapus");
            }
        } catch (error) {
            console.error("Error updating cart on backend:", error);
            setItems(items); // Rollback state jika API gagal
            const errorMessage = error.response?.data?.message || "Failed to update item quantity. Please try again.";
            toast.error(errorMessage);
            if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
                logout();
            }
        }
    };

    const removeFromCart = async (itemId, sizeToRemove) => {
        if (!token) {
            toast.error("Please log in to remove items from your cart.");
            navigate("/login");
            return;
        }

        if (!items[itemId] || !items[itemId][sizeToRemove]) {
            toast.error("Item not found in cart to remove.");
            return;
        }

        let updatedItems = structuredClone(items);
        delete updatedItems[itemId][sizeToRemove];
        if (Object.keys(updatedItems[itemId]).length === 0) {
            delete updatedItems[itemId];
        }
        setItems(updatedItems);

        try {
            await api.delete("/api/cart/remove", {
                headers: { Authorization: `Bearer ${token}` },
                data: { productId: itemId, size: sizeToRemove }
            });
            toast.success("Item removed from cart!");
        } catch (error) {
            console.error("Error removing from cart on backend:", error);
            setItems(items); // Rollback state jika API gagal
            const errorMessage = error.response?.data?.message || "Failed to remove item. Please try again.";
            toast.error(errorMessage);
            if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
                logout();
            }
        }
    };

    const getCartCount = useCallback(() => {
        let totalCount = 0;
        for (const foodId in items) {
            for (const size in items[foodId]) {
                totalCount += items[foodId][size];
            }
        }
        return totalCount;
    }, [items]);

    const getCartAmount = useCallback(() => {
        let totalAmount = 0;
        for (const foodId in items) {
            let filteredFood = foods.find((food) => food._id === foodId);

            if (!filteredFood) {
                continue;
            }

            for (const size in items[foodId]) {
                const quantity = items[foodId][size];
                const priceOption = filteredFood.prices?.find(p => p.size === size);
                if (priceOption) {
                    totalAmount += priceOption.price * quantity;
                }
            }
        }
        return totalAmount;
    }, [items, foods]);

    const getWeightAmount = useCallback(() => {
        let totalWeight = 0;
        for (const foodId in items) {
            let filteredFood = foods.find((food) => food._id === foodId);

            if (!filteredFood) {
                continue;
            }

            for (const size in items[foodId]) {
                const quantity = items[foodId][size];
                const weightOption = filteredFood.prices?.find(p => p.size === size);
                if (weightOption) {
                    totalWeight += weightOption.weight * quantity;
                }
            }
        }
        return totalWeight;
    }, [items, foods]);

    const getProductsData = useCallback(async () => {
        try {
            const response = await api.get('/api/product');
            if (response.data.success) {
                setFoods(response.data.products);
            } else {
                toast.error(response.data.message || "Failed to load products.");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Could not load products. Please try again.");
        }
    }, []);

    const getUserCart = useCallback(async (currentToken) => {
        if (!currentToken) {
            setItems({});
            return;
        }
        try {
            const response = await api.get("/api/cart/", {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            if (response.data.success) {
                setItems(response.data.items || {});
            } else {
                toast.error(response.data.message || "Failed to load cart data.");
                setItems({});
            }
        } catch (error) {
            console.error("Error fetching user cart:", error);
            const errorMessage = error.response?.data?.message || "Failed to fetch cart data.";
            toast.error(errorMessage);
            setItems({});

            if (error.response?.status === 401) {
                toast.error("Your session has expired. Please log in again.");
                logout();
            }
        }
    }, [logout]);

    const fetchUserOrders = useCallback(async () => {
        if (!token) {
            setUserOrders([]);
            return;
        }
        try {
            const response = await api.get("/api/order/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.data.success) {
                toast.error(response.data.message || "Gagal memuat daftar pesanan.");
                setUserOrders([]);
                return;
            }
    
            // --- Mulai logika untuk mengambil detail dan invoice per pesanan ---
            const ordersWithDetails = await Promise.all(response.data.orders.map(async (order) => {
                try {
                    // Ambil detail pesanan
                    const detailResponse = await api.get(`/api/order/${order._id}/details`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!detailResponse.data.success || !detailResponse.data.orderDetail) {
                        console.warn(`Gagal mendapatkan detail untuk order ${order._id}. Melewatkan detail.`);
                        return order; // Kembalikan order dasar jika detail gagal
                    }
    
                    // Ambil invoice
                    const invoiceResponse = await api.get(`/api/order/invoice/by-order-detail/${detailResponse.data.orderDetail._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!invoiceResponse.data.success || !invoiceResponse.data.invoiceData) {
                        console.warn(`Gagal mendapatkan invoice untuk order ${order._id}. Melewatkan invoice.`);
                        return { // Tetap kembalikan detail yang ada meskipun invoice gagal
                            ...order,
                            orderDetailId: detailResponse.data.orderDetail._id,
                            items: detailResponse.data.orderDetail.items.map((item) => ({
                                _id: item.productId ? item.productId._id : item._id, // Pastikan ID produk konsisten
                                name: item.name,
                                size: item.size,
                                weight: item.weight,
                                quantity: item.quantity,
                                price: item.price,
                                totalPrice: item.totalPrice,
                                image: item.image || (item.productId && item.productId.image),
                            })),
                        };
                    }
    
                    // Gabungkan semua data
                    return {
                        ...order,
                        orderDetailId: detailResponse.data.orderDetail._id,
                        invoiceId: invoiceResponse.data.invoiceData.kodeInvoice.replace('INV-', ''),
                        // Pastikan item-item dari orderDetail diambil dan disesuaikan
                        items: detailResponse.data.orderDetail.items.map((item) => ({
                            _id: item.productId ? item.productId._id : item._id, // Pastikan ID produk konsisten
                            name: item.name,
                            size: item.size,
                            weight: item.weight,
                            quantity: item.quantity,
                            price: item.price,
                            totalPrice: item.totalPrice,
                            image: item.image || (item.productId && item.productId.image), // Pilih gambar yang benar
                        })),
                    };
                } catch (detailError) {
                    console.error(`Error fetching detail/invoice for order ${order._id}:`, detailError);
                    // Jika terjadi error pada pengambilan detail/invoice, kembalikan order dasar saja
                    return order;
                }
            }));
            // --- Akhir logika untuk mengambil detail dan invoice per pesanan ---
    
            setUserOrders(ordersWithDetails); // Simpan data pesanan yang sudah lengkap
        } catch (error) {
            console.error("Error fetching user orders:", error);
            const errorMessage = error.response?.data?.message || "Gagal memuat daftar pesanan. Silakan coba lagi.";
            toast.error(errorMessage);
            setUserOrders([]);
            if (error.response?.status === 401) {
                logout();
            }
        }
    }, [token, logout]);

    // --- FUNGSI BARU UNTUK MENGAMBIL ULASAN PENGGUNA ---
    const fetchUserReviews = useCallback(async () => {
        if (!token) {
            setUserProductReviews([]); // Pastikan state ulasan dibersihkan saat tidak ada token
            return;
        }
        try {
            // PENTING: Anda perlu membuat endpoint ini di backend Anda.
            // Contoh: GET /api/reviews/user-specific
            // Endpoint ini harus mengembalikan array semua ulasan yang dibuat oleh pengguna yang sedang login.
            // Contoh response: { success: true, reviews: [{ _id, orderId, productId, rating, comment, ... }] }
            const response = await api.get('/api/reviews/user-specific', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUserProductReviews(response.data.reviews);
            } else {
                console.error("Failed to fetch user reviews:", response.data.message);
                // toast.error("Gagal memuat ulasan Anda."); // Aktifkan jika ingin user melihat error
                setUserProductReviews([]); // Kosongkan jika gagal
            }
        } catch (error) {
            console.error("Error fetching user reviews:", error);
            // toast.error("Terjadi kesalahan saat memuat ulasan Anda."); // Aktifkan jika ingin user melihat error
            setUserProductReviews([]); // Kosongkan jika error
            if (error.response?.status === 401) {
                logout(); // Logout jika token tidak valid
            }
        }
    }, [token, logout]);


    const submitReview = async (reviewData) => {
        if (!token) {
            toast.error("Silakan login untuk memberikan ulasan.");
            navigate("/login");
            return { success: false, message: "Tidak terotentikasi." };
        }
        try {
            const response = await api.post("/api/reviews", reviewData, { 
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.data.success) {
                toast.success(response.data.message || "Ulasan berhasil dikirim!");
                fetchUserOrders();
                fetchUserReviews(); // Tetap panggil ini untuk memperbarui status ulasan
                return { success: true, review: response.data.review };
            } else {
                toast.error(response.data.message || "Gagal mengirim ulasan.");
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            const errorMessage = error.response?.data?.message || "Gagal mengirim ulasan. Silakan coba lagi.";
            toast.error(errorMessage);
            if (error.response?.status === 401) {
                logout();
            }
            return { success: false, message: errorMessage };
        }
    };

    useEffect(() => {
        getProductsData();
        if (token) {
            getUserCart(token);
            fetchUserOrders();
            fetchUserReviews(); // Panggil fungsi untuk mengambil ulasan saat token berubah
        }
    }, [token, getProductsData, getUserCart, fetchUserOrders, fetchUserReviews]); // TAMBAHKAN fetchUserReviews ke dependencies


    const contextValue = {
        foods,
        currency,
        token,
        setToken,
        logout,
        navigate,
        items,
        setItems,
        addToCart,
        removeFromCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        getWeightAmount,
        backendUrl,
        userOrders,
        fetchUserOrders,
        submitReview,
        userProductReviews,
        fetchUserReviews,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

ShopContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
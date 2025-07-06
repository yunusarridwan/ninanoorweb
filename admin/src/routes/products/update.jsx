// src/routes/products/update.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { CirclePlus, Trash2, Home, Package } from "lucide-react";
import api from "@/utils/api";
import upload_icon from "../../assets/upload_icon.png";
import { Breadcrumb } from "flowbite-react";
import { useTheme } from "@/hooks/use-theme";

// Definisikan daftar ukuran yang diizinkan di luar komponen
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', 'H', 'F'];

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [image, setImage] = useState(null); // Bisa berupa File object atau URL string
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [prices, setPrices] = useState([]); // Array of { size, price, weight }
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    // const [categoryName, setCategoryName] = useState(""); // categoryName tidak lagi diperlukan jika select bind ke selectedCategoryId
    const [popular, setPopular] = useState(false);
    const [status, setStatus] = useState("Active"); // 'Active' or 'Non-active'
    
    const [isLoading, setIsLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({}); // State untuk error validasi

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setFormErrors({}); // Bersihkan error saat memuat data baru

        let productData = null;
        let fetchedCategories = [];

        try {
            // Fetch product data
            const productResponse = await api.get(`/api/product/${id}`);
            if (!productResponse.data.success || !productResponse.data.product) {
                toast.error(
                    productResponse.data.message || "Gagal memuat data produk (respon backend gagal)."
                );
                navigate("/products"); // Arahkan kembali ke daftar produk jika tidak ditemukan
                return;
            }
            productData = productResponse.data.product;

            // Fetch category data
            const categoriesResponse = await api.get("/api/categories");
            fetchedCategories = categoriesResponse.data.data;

            if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
                setCategories(fetchedCategories);
            } else {
                setCategories([]);
                toast.warn("Tidak ada kategori ditemukan. Mohon tambahkan kategori di backend.");
            }

            // Set state based on fetched data
            setName(productData.name);
            setDescription(productData.description);

            if (Array.isArray(productData.prices)) {
                const loadedPrices = productData.prices.map(item => ({
                    size: item.size,
                    price: item.price.toString(), // Pastikan price dan weight adalah string untuk input type="number"
                    weight: item.weight.toString(),
                }));
                setPrices(loadedPrices);
            } else {
                setPrices([]);
            }

            setPopular(productData.popular);
            setStatus(productData.status || "Active"); // Pastikan status ada atau default ke 'Active'
            setImage(productData.image); // Ini akan menjadi URL string dari gambar yang sudah ada

            // Determine selected category
            let initialSelectedId = "";

            // Jika categoryId adalah objek (hasil populate)
            if (productData.categoryId && typeof productData.categoryId === 'object') {
                initialSelectedId = productData.categoryId._id;
            } else if (typeof productData.categoryId === 'string') { // Jika categoryId hanya string ID
                initialSelectedId = productData.categoryId;
            }

            // Jika ID kategori produk tidak ditemukan di daftar kategori yang diambil, atau tidak ada ID
            // Coba default ke kategori pertama jika ada
            const foundCat = fetchedCategories.find((cat) => cat._id === initialSelectedId);
            if (!foundCat && fetchedCategories.length > 0) {
                initialSelectedId = fetchedCategories[0]._id;
            } else if (!foundCat && fetchedCategories.length === 0) {
                initialSelectedId = ""; // Tidak ada kategori untuk dipilih
            }

            setSelectedCategoryId(initialSelectedId);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(
                error.response?.data?.message ||
                "Gagal mengambil data produk atau kategori (kesalahan jaringan/server)."
            );
            // Reset states on total failure
            setName(""); setDescription(""); setPrices([]); setPopular(false); setStatus("Active"); setImage(null); setSelectedCategoryId("");
            setCategories([]);
            navigate("/products"); // Redirect jika terjadi error parah saat fetching
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]); // Set to File object for new upload
            // Hapus error gambar jika sudah ada yang diupload
            setFormErrors(prev => ({ ...prev, image: undefined }));
        }
    };

    const addSizePrice = () => {
        setPrices([...prices, { size: "", price: "", weight: "" }]);
        // Hapus error umum prices jika sudah ada
        setFormErrors(prev => ({ ...prev, prices: undefined }));
    };

    const handleSizePriceChange = (index, field, value) => {
        const updatedPrices = prices.map((item, i) => {
            if (i === index) {
                let newValue = value;
                // Validasi untuk input number (price, weight) agar tidak bisa negatif di UI langsung
                if (field === "price" || field === "weight") {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        newValue = value; // Biarkan nilai string jika tidak valid secara angka
                    } else {
                        newValue = numValue.toString(); // Simpan sebagai string untuk input type="number"
                    }
                }
                // Normalisasi ukuran ke UPPERCASE saat diketik
                if (field === "size") {
                    newValue = value.toUpperCase();
                }
                return { ...item, [field]: newValue };
            }
            return item;
        });
        setPrices(updatedPrices);
        // Bersihkan error spesifik jika input berubah
        setFormErrors(prev => {
            const newPricesDetail = [...(prev.pricesDetail || [])];
            if (newPricesDetail[index]) {
                delete newPricesDetail[index][field];
                if (Object.keys(newPricesDetail[index]).length === 0) {
                    newPricesDetail[index] = null; // Tandai untuk dihapus
                }
            }
            // Filter nulls dan undefined
            return { ...prev, pricesDetail: newPricesDetail.filter(Boolean) };
        });
    };

    const removeSizePrice = (index) => {
        setPrices(prices.filter((_, i) => i !== index));
        // Sesuaikan formErrors jika ada entri yang dihapus
        setFormErrors(prev => {
            const newPricesDetail = (prev.pricesDetail || []).filter((_, i) => i !== index);
            // Jika setelah penghapusan, tidak ada lagi entri harga dan ada error prices, hapus error prices
            if (newPricesDetail.length === 0 && prev.prices) {
                delete prev.prices; 
            }
            return { ...prev, pricesDetail: newPricesDetail };
        });
    };

    // --- Fungsi Validasi Form Utama ---
    const validateForm = () => {
        const errors = {}; // Pastikan 'errors' dideklarasikan di sini

        if (!name.trim()) {
            errors.name = "Nama produk wajib diisi.";
        }
        if (!description.trim()) {
            errors.description = "Deskripsi produk wajib diisi.";
        }
        if (!selectedCategoryId) {
            errors.category = "Kategori produk wajib dipilih.";
        }
        // Validasi gambar: Jika 'image' adalah null atau string kosong (bukan URL atau File baru)
        if (!image && !(typeof image === 'string' && image.startsWith('http'))) {
            errors.image = "Gambar produk wajib diunggah atau dipertahankan.";
        }
        // 'status' juga harus divalidasi, pastikan tidak kosong
        if (!status.trim()) {
            errors.status = "Status produk wajib dipilih.";
        }


        // Validasi Harga/Ukuran/Berat
        if (prices.length === 0) {
            errors.prices = "Produk harus memiliki setidaknya satu ukuran, harga, dan berat.";
        } else {
            const priceErrors = prices.map((item, index) => {
                const itemErrors = {};
                const trimmedSize = item.size.trim().toUpperCase();

                if (!trimmedSize) {
                    itemErrors.size = `Ukuran untuk entri #${index + 1} wajib diisi.`;
                } else if (!ALLOWED_SIZES.includes(trimmedSize)) {
                    itemErrors.size = `Ukuran untuk entri #${index + 1} harus salah satu dari: ${ALLOWED_SIZES.join(', ')}.`;
                }

                const priceNum = parseFloat(item.price);
                if (isNaN(priceNum) || priceNum < 0) {
                    itemErrors.price = `Harga untuk entri #${index + 1} harus berupa angka positif.`;
                }
                const weightNum = parseFloat(item.weight);
                if (isNaN(weightNum) || weightNum < 0) {
                    itemErrors.weight = `Berat untuk entri #${index + 1} harus berupa angka positif.`;
                }
                return Object.keys(itemErrors).length > 0 ? itemErrors : null;
            }).filter(Boolean); // Filter out nulls (valid entries)

            if (priceErrors.length > 0) {
                errors.pricesDetail = priceErrors;
            }
        }

        setFormErrors(errors);
        return errors; // Mengembalikan objek errors, bukan boolean
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const errors = validateForm(); // Panggil validasi dan dapatkan objek errors

        if (Object.keys(errors).length > 0) { // Cek jika ada errors
            // Tampilkan semua error menggunakan toast
            Object.values(errors).forEach(err => {
                if (typeof err === 'string') {
                    toast.error(err);
                } else if (Array.isArray(err)) {
                    err.forEach(subErr => {
                        Object.values(subErr).forEach(msg => toast.error(msg));
                    });
                }
            });
            toast.error("Mohon perbaiki kesalahan dalam formulir.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("prices", JSON.stringify(prices.map(item => ({
                size: item.size.trim().toUpperCase(),
                price: parseFloat(item.price),
                weight: parseFloat(item.weight),
            }))));
            formData.append("categoryId", selectedCategoryId);
            formData.append("popular", popular);
            formData.append("status", status); // Tambahkan status ke FormData

            if (image instanceof File) { // Hanya append jika itu objek File baru (gambar baru diunggah)
                formData.append("image", image);
            }

            const response = await api.put(`/api/product/${id}`, formData);

            if (response.data.success) {
                toast.success("Produk berhasil diperbarui.");
                navigate("/products");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error(error.response?.data?.message || "Gagal memperbarui produk. Cek log server.");
        }
    };

    // Definisikan handleStatusChange di sini
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        // Hapus error status jika sudah ada
        setFormErrors(prev => ({ ...prev, status: undefined }));
    };

    if (isLoading) {
        return (
            <div className={`flex flex-col gap-y-4 p-6 text-center text-lg ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                Memuat data produk...
            </div>
        );
    }

    return (
        <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            {/* Breadcrumb */}
            <Breadcrumb aria-label="Update Product page breadcrumb" className="mb-4">
                <Breadcrumb.Item href="/" icon={Home}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/products">
                    Products
                </Breadcrumb.Item>
                <Breadcrumb.Item>Edit Product</Breadcrumb.Item>
            </Breadcrumb>
            {/* --- */}

            <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Edit Produk</h2>

            {/* Modern Card Container for the Form */}
            <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div>
                        <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Nama Produk
                        </label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            type="text"
                            id="name"
                            placeholder="Nama Produk"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                            } ${formErrors.name ? 'border-red-500' : ''}`} // Styling error
                            required
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Product Description */}
                    <div>
                        <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Deskripsi Produk
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            id="description"
                            placeholder="Deskripsi Produk"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                            } ${formErrors.description ? 'border-red-500' : ''}`} // Styling error
                            required
                        />
                        {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Kategori
                        </label>
                        <select
                            onChange={(e) => {
                                setSelectedCategoryId(e.target.value);
                                setFormErrors(prev => ({ ...prev, category: undefined })); // Clear category error on change
                            }}
                            value={selectedCategoryId}
                            id="category"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                            } ${formErrors.category ? 'border-red-500' : ''}`} // Styling error
                            required
                        >
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">Memuat Kategori...</option>
                            )}
                        </select>
                        {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                    </div>

                    {/* Product Status */}
                    <div>
                        <label htmlFor="status" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Status Produk
                        </label>
                        <select
                            onChange={handleStatusChange} // Menggunakan handleStatusChange yang sudah didefinisikan
                            value={status}
                            id="status"
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                            } ${formErrors.status ? 'border-red-500' : ''}`} // Styling error
                            required
                        >
                            <option value="Active">Active</option>
                            <option value="Non-active">Non-active</option>
                        </select>
                        {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <h5 className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Gambar Produk
                        </h5>
                        <label htmlFor="image-upload" className="cursor-pointer mt-1 block">
                            <img
                                src={
                                    image instanceof File
                                        ? URL.createObjectURL(image)
                                        : typeof image === 'string' && image // If image is a string (URL from backend)
                                            ? image
                                            : upload_icon // Fallback to default upload icon
                                }
                                alt="Product Image"
                                className={`w-24 h-24 object-cover ring-1 ring-slate-900/5 rounded-lg shadow-sm ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                                } ${formErrors.image ? 'border-2 border-red-500' : ''}`} // Styling error
                            />
                            <input
                                type="file"
                                onChange={handleImageChange}
                                name="image"
                                id="image-upload"
                                hidden
                            />
                        </label>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Klik gambar untuk mengubah. Biarkan kosong untuk mempertahankan gambar lama.
                        </p>
                        {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
                    </div>


                    {/* Size and Pricing (Dynamic Fields) */}
                    <div className="md:col-span-2">
                        <h5 className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Ukuran dan Harga
                        </h5>
                        {prices.map((item, index) => (
                            <div key={index} className="flex flex-wrap items-center gap-2 mt-2">
                                {/* Input Ukuran */}
                                <input
                                    onChange={(e) => handleSizePriceChange(index, "size", e.target.value)}
                                    value={item.size}
                                    type="text"
                                    placeholder="Ukuran (e.g., S, M, L, H, F)"
                                    className={`px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-32 ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                                    } ${formErrors.pricesDetail && formErrors.pricesDetail[index]?.size ? 'border-red-500' : ''}`}
                                />
                                {/* Input Harga */}
                                <input
                                    onChange={(e) => handleSizePriceChange(index, "price", e.target.value)}
                                    value={item.price}
                                    type="number"
                                    placeholder="Harga"
                                    min={0}
                                    className={`px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-32 ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                                    } ${formErrors.pricesDetail && formErrors.pricesDetail[index]?.price ? 'border-red-500' : ''}`}
                                />
                                {/* Input Berat */}
                                <input
                                    onChange={(e) => handleSizePriceChange(index, "weight", e.target.value)}
                                    value={item.weight}
                                    type="number"
                                    placeholder="Berat (gram)"
                                    min={0}
                                    className={`px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-32 ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                                    } ${formErrors.pricesDetail && formErrors.pricesDetail[index]?.weight ? 'border-red-500' : ''}`}
                                />
                                <button
                                    onClick={() => removeSizePrice(index)}
                                    type="button"
                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 transition-colors duration-200"
                                    title="Hapus Ukuran/Harga ini"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {formErrors.prices && <p className="text-red-500 text-xs mt-1">{formErrors.prices}</p>}
                        {/* Render individual errors for price details */}
                        {formErrors.pricesDetail && formErrors.pricesDetail.map((err, idx) => (
                            // Pastikan err tidak null atau undefined sebelum di-map
                            err && Object.values(err).map((msg, i) => (
                                <p key={`${idx}-${i}`} className="text-red-500 text-xs mt-1 ml-2">{msg}</p>
                            ))
                        ))}
                        <button
                            onClick={addSizePrice}
                            type="button"
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-x-2 text-sm shadow-sm transition-colors duration-200"
                        >
                            <CirclePlus size={20} /> Tambah Ukuran
                        </button>
                    </div>

                    {/* Popular Checkbox */}
                    <div className="md:col-span-2 flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            checked={popular}
                            onChange={() => setPopular(!popular)}
                            id="popular"
                            className={`form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 ${
                                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                            }`}
                        />
                        <label className={`cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="popular">
                            Tandai sebagai Produk Populer
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <Package size={18} className="mr-2" /> Perbarui Produk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;
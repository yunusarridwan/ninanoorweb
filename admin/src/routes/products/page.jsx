import { useEffect, useState, useCallback, useMemo } from "react"; // Tambahkan useMemo
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Eye, Pencil, Trash2, Home, Package } from "lucide-react";
import { Breadcrumb } from "flowbite-react";
import { useTheme } from "@/hooks/use-theme";
import DetailProduct from "./detail"; // Ensure this path is correct

const ProductPage = () => {
    const { theme } = useTheme();
    const [allProducts, setAllProducts] = useState([]); // State baru untuk menyimpan semua produk
    const [loading, setLoading] = useState(true); // State untuk loading
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3); // Jumlah item per halaman tetap 5
    // totalProducts tidak lagi dibutuhkan dari BE secara langsung untuk pagination FE

    const productStatusOptions = {
        "all": { label: "Semua" },
        "Active": { label: "Aktif" },
        "Non-active": { label: "Non-aktif" },
    };

    // --- Mengambil SEMUA produk dari API ---
    // Panggilan API ini tidak lagi menggunakan parameter page dan limit
    const fetchAllProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Kita tidak lagi mengirim page dan limit ke BE
            const response = await api.get(`/api/product?search=${search}&status=${filterStatus === 'all' ? '' : filterStatus}`);
            setAllProducts(response.data.products); // Asumsi BE mengembalikan semua produk dalam array 'products'
            setCurrentPage(1); // Reset halaman ke 1 setiap kali filter atau pencarian berubah
        } catch (error) {
            console.error("Error fetching all product list:", error);
            toast.error(
                error.response?.data?.message || "Failed to fetch all product list"
            );
            setAllProducts([]);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]); // Dependensi berubah karena semua filter ditangani di FE

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    // --- Filter dan Pencarian di Frontend ---
    const filteredProducts = useMemo(() => {
        let tempProducts = [...allProducts]; // Buat salinan agar tidak memodifikasi state asli

        // Terapkan pencarian
        if (search) {
            const lowercasedSearch = search.toLowerCase();
            tempProducts = tempProducts.filter(
                (product) =>
                    product.name.toLowerCase().includes(lowercasedSearch) ||
                    (product.categoryId && product.categoryId.name.toLowerCase().includes(lowercasedSearch)) // Pastikan categoryId ada
            );
        }

        // Terapkan filter status
        if (filterStatus !== "all") {
            tempProducts = tempProducts.filter(
                (product) => product.status === filterStatus
            );
        }
        return tempProducts;
    }, [allProducts, search, filterStatus]);


    // --- Logika Pagination di Frontend ---
    const totalProductsFiltered = filteredProducts.length; // Total produk setelah filter
    const totalPages = Math.ceil(totalProductsFiltered / itemsPerPage);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <button key="1" onClick={() => paginate(1)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    1
                </button>
            );
            if (startPage > 2) {
                pageNumbers.push(<span key="ellipsis-start" className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === i
                            ? "bg-blue-600 text-white"
                            : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
                    }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="ellipsis-end" className={`px-3 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>...</span>);
            }
            pageNumbers.push(
                <button key={totalPages} onClick={() => paginate(totalPages)} className={`px-3 py-1 rounded text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    const handleEditProduct = (product) => {
        navigate(`/products/update/${product._id}`);
    };

    const handleAddProduct = () => {
        navigate("/products/add");
    };

    const handleStatusFilterClick = (status) => {
        setFilterStatus(status);
        setCurrentPage(1); // Reset to page 1 on new filter
    };


    return (
        <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            {/* Breadcrumb */}
            <Breadcrumb aria-label="Products page breadcrumb" className="mb-4">
                <Breadcrumb.Item href="/" icon={Home}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item>Products</Breadcrumb.Item>
            </Breadcrumb>
            {/* --- */}

            <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Daftar Produk</h2>

            {/* Filter and Add Product Section */}
            <div className={`rounded-lg shadow-sm p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Search and Status Buttons row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama produk atau kategori"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            // setCurrentPage(1) sudah dilakukan di fetchAllProducts karena search menjadi dependensi
                        }}
                        className={`p-2 border rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {Object.keys(productStatusOptions).map((statusKey) => (
                            <button
                                key={statusKey}
                                onClick={() => handleStatusFilterClick(statusKey)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                    ${filterStatus === statusKey
                                        ? `bg-teal-500 text-white`
                                        : `bg-gray-200 text-gray-700 hover:bg-gray-300 ${theme === 'dark' ? 'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}`
                                    }`}
                            >
                                {productStatusOptions[statusKey].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add Product Button row - Separated for alignment control */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleAddProduct}
                        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                        <Package size={18} /> <span>Tambah Produk</span>
                    </button>
                </div>
            </div>

            {/* Product List Table */}
            <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <table className="min-w-full table-auto border-collapse">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'}`}>
                        <tr>
                            <th className={`px-4 py-3 text-left w-[5%] text-xs font-semibold uppercase tracking-wider rounded-tl-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No</th>
                            <th className={`px-4 py-3 text-left w-[20%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Produk</th>
                            <th className={`px-4 py-3 text-left w-[25%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Deskripsi</th>
                            <th className={`px-4 py-3 text-left w-[10%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Kategori</th>
                            <th className={`px-4 py-3 text-left w-[10%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ditambahkan Oleh</th>
                            <th className={`px-4 py-3 text-left w-[10%] text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                            <th className={`px-4 py-3 text-center w-[10%] text-xs font-semibold uppercase tracking-wider rounded-tr-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody className={`${theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-100'}`}>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className={`px-4 py-4 text-center text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Memuat produk...
                                </td>
                            </tr>
                        ) : currentProducts.length > 0 ? ( // Gunakan currentProducts di sini
                            currentProducts.map((product, index) => (
                                <tr key={product._id} className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-b hover:bg-gray-50'}`}>
                                    <td className={`px-4 py-3 text-center align-top text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                        {index + 1 + (currentPage - 1) * itemsPerPage}
                                    </td>
                                    <td className={`px-4 py-3 align-top text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                                        <div className="flex items-start gap-x-4">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/60?text=No+Image'}
                                                alt={product.name}
                                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
                                            />
                                            <p className="font-medium break-words">{product.name}</p>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                        <p className="line-clamp-3">
                                            {product.description}
                                        </p>
                                    </td>
                                    <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                        {product.categoryId ? product.categoryId.name : 'N/A'}
                                    </td>
                                    <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                        {product.adminId ? product.adminId.name : 'N/A'}
                                    </td>
                                    <td className={`px-4 py-3 text-left text-sm align-top ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                        {product.status || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <div className="flex items-center justify-center gap-x-2">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-green-500 hover:text-green-700 p-1 transition-colors duration-200"
                                                title="Edit Produk"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {/* <button
                                                onClick={() => console.log('Delete product', product._id)}
                                                className="text-red-500 hover:text-red-700 p-1 transition-colors duration-200"
                                                title="Hapus Produk"
                                            >
                                                <Trash2 size={16} />
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={`px-4 py-4 text-center text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Tidak ada produk ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={`flex justify-center items-center gap-4 py-4 mt-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded disabled:opacity-50 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        Previous
                    </button>
                    <div className="flex gap-2">
                        {renderPageNumbers()}
                    </div>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded disabled:opacity-50 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        Next
                    </button>
                </div>
            )}
            {/* Detail Product Modal */}
            {selectedProduct && (
                <DetailProduct product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </div>
    );
};

export default ProductPage;
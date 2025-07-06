import { Button, Modal } from "flowbite-react";
import PropTypes from 'prop-types'; // 🔹 Import PropTypes
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const DetailProduct = ({ product, onClose }) => {
    const { theme } = useTheme(); // Use the theme hook

    // Fungsi untuk format ke IDR
    const formatToIDR = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'N/A';
        }
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (!product) {
        return null;
    }

    const getCategoryName = () => {
        if (product.categoryId && typeof product.categoryId === 'object' && product.categoryId.name) {
            return product.categoryId.name;
        }
        if (typeof product.categoryId === 'string') {
            return product.categoryId;
        }
        return 'N/A';
    };

    return (
        <Modal show={!!product} onClose={onClose} dismissible>
            {/* Modal Header - Apply theme to it */}
            <Modal.Header className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Detail Produk</span>
            </Modal.Header>

            {/* Modal Body - Apply theme to it */}
            <Modal.Body className={`${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'} p-4`}>
                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <img
                            src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name || 'Produk'}
                            className="w-32 h-32 rounded-lg object-cover shadow-md border border-gray-200 dark:border-gray-600"
                        />
                    </div>

                    {/* Refined Grid Layout for Product Details */}
                    {/* Changed to 2 columns on all sizes for better vertical stacking */}
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4`}>
                        {/* Nama */}
                        <div className="col-span-1 md:col-span-2"> {/* Spans full width on small, half on medium+ */}
                            <strong>Nama:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{product.name || 'N/A'}</span>
                        </div>

                        {/* Kategori - Now directly under Nama */}
                        <div className="col-span-1 md:col-span-2"> {/* Spans full width on small, half on medium+ */}
                            <strong>Kategori:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{getCategoryName()}</span>
                        </div>

                        {/* Deskripsi - Spans all columns */}
                        <div className="col-span-1 md:col-span-2">
                            <strong>Deskripsi:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{product.description || 'N/A'}</span>
                        </div>

                        {/* Populer */}
                        <div className="col-span-1">
                            <strong>Populer:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{product.popular ? 'Ya' : 'Tidak'}</span>
                        </div>

                        {/* Status - Now directly under Populer */}
                        <div className="col-span-1">
                            <strong>Status:</strong> <span className={`font-medium ${product.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{product.status || 'N/A'}</span>
                        </div>

                        {/* Ditambahkan Oleh */}
                        <div className="col-span-1 md:col-span-2"> {/* Spans full width on small, half on medium+ */}
                            <strong>Ditambahkan Oleh:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{product.adminId ? product.adminId.name : 'N/A'}</span>
                        </div>

                        {/* Terakhir Diubah Oleh (conditional) */}
                        {product.updatedBy && product.updatedBy._id !== product.adminId._id && (
                            <div className="col-span-1 md:col-span-2"> {/* Spans full width on small, half on medium+ */}
                                <strong>Terakhir Diubah Oleh:</strong> <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{product.updatedBy.name || 'N/A'}</span>
                            </div>
                        )}
                    </div>

                    {/* Menampilkan Ukuran, Harga, dan Berat dalam satu bagian yang lebih jelas dan rapi */}
                    <h4 className={`font-semibold text-lg mt-6 mb-2 border-t pt-4 ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-200 text-gray-800'}`}>Detail Ukuran & Harga:</h4>
                    {product.prices && Array.isArray(product.prices) && product.prices.length > 0 ? (
                        <ul className={`list-disc pl-5 space-y-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {product.prices.map((item, index) => (
                                <li key={index} className="text-sm">
                                    Ukuran: <span className={`${theme === 'dark' ? 'font-semibold text-gray-100' : 'font-semibold text-gray-900'}`}>{item.size || 'N/A'}</span>, {' '}
                                    Harga: <span className={`${theme === 'dark' ? 'font-semibold text-gray-100' : 'font-semibold text-gray-900'}`}>{formatToIDR(item.price)}</span>, {' '}
                                    Berat: <span className={`${theme === 'dark' ? 'font-semibold text-gray-100' : 'font-semibold text-gray-900'}`}>{item.weight !== undefined && !isNaN(item.weight) ? `${item.weight} gram` : 'N/A'}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada detail ukuran dan harga tersedia.</p>
                    )}
                </div>
            </Modal.Body>

            {/* Modal Footer - Apply theme to it */}
            <Modal.Footer className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <Button onClick={onClose} className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}>Tutup</Button>
            </Modal.Footer>
        </Modal>
    );
};

// 🔹 Tambahkan validasi prop-types
DetailProduct.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        image: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        categoryId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            }),
        ]),
        popular: PropTypes.bool,
        status: PropTypes.string,
        prices: PropTypes.arrayOf(PropTypes.shape({
            size: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            weight: PropTypes.number.isRequired,
        })),
        adminId: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
        updatedBy: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }),
    }),
    onClose: PropTypes.func.isRequired,
};

export default DetailProduct;
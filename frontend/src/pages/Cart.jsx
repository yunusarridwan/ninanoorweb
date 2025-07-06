import { useContext, useEffect, useState } from 'react';
import Title from '../components/Title';
import { ShopContext } from '../context/ShopContextDef';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaMinus, FaPlus } from 'react-icons/fa6';
import CartTotal from '../components/CartTotal';
import Footer from '../components/Footer';
import { Modal, Button } from 'flowbite-react';


const Cart = () => {
    const ITEMS_PER_PAGE = 3;

    const { foods, items, navigate, updateQuantity, currency,} = useContext(ShopContext); 

    const [cartData, setCartData] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // --- STATE BARU UNTUK MODAL KONFIRMASI PENGHAPUSAN ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // Ubah itemToDelete untuk menyimpan nama produk juga
    const [itemToDelete, setItemToDelete] = useState(null); // { _id: 'productId', name: 'productName', size: 'sizeName' }
    // --- AKHIR STATE BARU ---


    const formatCurrency = (amount, currencyCode = "IDR") => {
        const validCurrency = ["IDR", "USD", "EUR"];
        const safeCurrency = validCurrency.includes(currencyCode.toUpperCase()) ? currencyCode.toUpperCase() : "IDR";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: safeCurrency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        if (items && Object.keys(items).length > 0 && foods.length > 0) { 
            const tempData = [];
            const initialQuantities = {};

            for (const productId in items) {
                if (Object.prototype.hasOwnProperty.call(items, productId)) { 
                    for (const size in items[productId]) {
                        if (Object.prototype.hasOwnProperty.call(items[productId], size)) {
                            const quantity = items[productId][size];
                            if (quantity > 0) {
                                tempData.push({
                                    _id: productId.toString(), 
                                    size: size,
                                    quantity: quantity
                                });
                                initialQuantities[`${productId.toString()}-${size}`] = quantity; 
                            }
                        }
                    }
                }
            }
            setCartData(tempData);
            setQuantities(initialQuantities);
            if (currentPage > 1 && tempData.length <= (currentPage - 1) * ITEMS_PER_PAGE) {
                setCurrentPage(1);
            }

        } else if (items && Object.keys(items).length === 0) {
            setCartData([]);
            setQuantities({});
            setCurrentPage(1);
        } else if (foods.length === 0) {
            setCartData([]);
            setQuantities({});
            setCurrentPage(1);
        }
    }, [items, foods, currentPage]);

    const totalPages = Math.ceil(cartData.length / ITEMS_PER_PAGE);
    const paginatedItems = cartData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const increment = (id, size) => {
        const key = `${id.toString()}-${size}`; 
        const newValue = (quantities[key] || 0) + 1; 
        setQuantities(prev => ({ ...prev, [key]: newValue }));
        updateQuantity(id.toString(), size, newValue); 
    };

    const decrement = (id, size) => {
        const key = `${id.toString()}-${size}`; 
        const currentQuantity = quantities[key] || 0;
        if (currentQuantity > 1) {
            const newValue = currentQuantity - 1;
            setQuantities(prev => ({ ...prev, [key]: newValue }));
            updateQuantity(id.toString(), size, newValue); 
        } else {
            // Ketika kuantitas menjadi 0 atau kurang, panggil modal konfirmasi
            showConfirmDeleteModal(id, size);
        }
    };

    // --- FUNGSI showConfirmDeleteModal YANG DIMODIFIKASI ---
    const showConfirmDeleteModal = (productId, size) => {
        const productData = foods.find(product => product._id.toString() === productId.toString());
        const productName = productData ? productData.name : "Produk Tidak Dikenal"; // Dapatkan nama produk

        setItemToDelete({ _id: productId, name: productName, size: size }); // Simpan nama produk juga
        setShowDeleteModal(true);
    };
    // --- AKHIR FUNGSI showConfirmDeleteModal YANG DIMODIFIKASI ---

    const confirmDeleteItem = () => {
        if (itemToDelete) {
            updateQuantity(itemToDelete._id, itemToDelete.size, 0);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const cancelDeleteItem = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    return (
        <section className='max-padd-container mt-24'>
            <div className='pt-6'>
                <Title title1={'Daftar'} title2={'Keranjang'} titleStyles={'h3'} />

                <div className='flex flex-col lg:flex-row gap-10'>
                    <div className='w-full lg:w-2/3 space-y-3'>
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => { 
                                const productData = foods.find(product => product._id.toString() === item._id.toString()); 
                                const key = `${item._id.toString()}-${item.size}`;
                                const itemQuantity = quantities[key] || 0;

                                if (!productData) {
                                    return (
                                        <div key={key} className='p-4 rounded-xl bg-white shadow-sm flex items-center justify-between text-red-500'>
                                            Produk tidak ditemukan atau sudah dihapus: {item._id.toString()} (Ukuran: {item.size})
                                            <FaRegTrashCan
                                                onClick={() => showConfirmDeleteModal(item._id.toString(), item.size)}
                                                className='cursor-pointer text-red-500 hover:text-red-700 ml-2'
                                            />
                                        </div>
                                    );
                                }
                                
                                const priceOption = productData.prices?.find(p => p.size === item.size);
                                const unitPrice = priceOption ? priceOption.price : 0;
                                const totalItemPrice = unitPrice * itemQuantity;

                                return (
                                    <div key={key} className='p-4 rounded-xl bg-white shadow-sm flex items-center justify-between'>
                                        <div className='flex items-center gap-4'>
                                            <img src={productData.image} alt={productData.name} className='w-16 sm:w-20 rounded-md' />
                                        </div>
                                        <div className='flex flex-col w-1/3'>
                                            <h5 className='h5 line-clamp-1 ml-2'>{productData.name}</h5>
                                            <p className='bold-14 text-gray-500 ml-2'>{item.size}</p>
                                        </div>
                                        <p className='bold-14 text-center w-1/5'>{formatCurrency(unitPrice, currency)}</p>
                                        <div className='flex items-center ring-1 ring-slate-900/5 rounded-full overflow-hidden bg-primary'>
                                            <button onClick={() => decrement(item._id.toString(), item.size)} className='p-2 bg-white text-secondary rounded-full'>
                                                <FaMinus className='text-xs' />
                                            </button>
                                            <p className='px-3'>{itemQuantity}</p>
                                            <button onClick={() => increment(item._id.toString(), item.size)} className='p-2 bg-white text-secondary rounded-full'>
                                                <FaPlus className='text-xs' />
                                            </button>
                                        </div>
                                        <p className='bold-14 text-center w-1/5'>{formatCurrency(totalItemPrice, currency)}</p>
                                        <FaRegTrashCan
                                            onClick={() => showConfirmDeleteModal(item._id.toString(), item.size)}
                                            className='cursor-pointer text-red-500 hover:text-red-700 ml-2'
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <p className='text-center text-gray-500'>Keranjang Anda kosong.</p>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4 gap-2">
                                <button
                                    className={`px-4 py-2 rounded text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                <span className="px-4 py-2 text-sm">{currentPage} / {totalPages}</span>
                                <button
                                    className={`px-4 py-2 rounded text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                    <div className='w-full lg:w-1/3 mb-6'>
                        <CartTotal />
                        <button 
                            onClick={() => navigate('/place-order')} 
                            className={`btn-dark w-full mt-7 ${cartData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={cartData.length === 0}
                        >
                            Proses Checkout
                        </button>
                    </div>
                </div>
            </div>
            <Footer />

            {/* --- MODAL KONFIRMASI PENGHAPUSAN PRODUK --- */}
            <Modal show={showDeleteModal} onClose={cancelDeleteItem}>
                <Modal.Header>Konfirmasi Penghapusan</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Apakah Anda yakin ingin menghapus produk 
                            <span className="font-semibold text-gray-800 ml-1">
                                {itemToDelete ? itemToDelete.name : ''}
                            </span>
                            {itemToDelete && itemToDelete.size && (
                                <span className="font-semibold text-gray-800">
                                    {' '} (Ukuran: {itemToDelete.size})
                                </span>
                            )}
                            {' '} dari keranjang?
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="failure" onClick={confirmDeleteItem}>Ya, Hapus!</Button>
                    <Button color="gray" onClick={cancelDeleteItem}>Batal</Button>
                </Modal.Footer>
            </Modal>
            {/* --- AKHIR MODAL KONFIRMASI PENGHAPUSAN PRODUK --- */}
        </section>
    );
};

export default Cart;
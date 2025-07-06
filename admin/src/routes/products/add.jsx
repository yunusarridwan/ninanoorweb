// src/pages/AddProduct.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CirclePlus, Trash2, Home, Package } from "lucide-react";
import api from "@/utils/api";
import upload_icon from "../../assets/upload_icon.png";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "flowbite-react";
import { useTheme } from "@/hooks/use-theme";

// Definisikan daftar ukuran yang diizinkan di luar komponen
// Agar tidak dibuat ulang setiap render dan mudah diakses
const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', 'H', 'F'];

const AddProduct = ({ adminId }) => {
  const { theme } = useTheme();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState([]); // Array of { size, price, weight }
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [popular, setPopular] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        const fetchedCategories = response.data.data;

        if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
          if (!selectedCategoryId) {
            setSelectedCategoryId(fetchedCategories[0]._id);
          }
        } else {
          setCategories([]);
          setSelectedCategoryId("");
          toast.warn("Tidak ada kategori ditemukan. Mohon tambahkan kategori di backend.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Gagal mengambil kategori. Error: ${error.message}`);
      }
    };
    fetchCategories();
  }, [selectedCategoryId]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const addSizePrice = () => {
    setPrices([...prices, { size: "", price: "", weight: "" }]);
  };

  const handleSizePriceChange = (index, field, value) => {
    const updatedPrices = prices.map((item, i) => {
      if (i === index) {
        let newValue = value;
        // Validasi untuk input number (price, weight)
        if (field === "price" || field === "weight") {
          // Konversi ke number, pastikan tidak kurang dari 0
          newValue = parseFloat(value);
          if (isNaN(newValue) || newValue < 0) {
            // Biarkan nilai string jika tidak valid, atau atur ke string kosong
            // Ini agar pengguna bisa melihat input yang salah, tapi validasi utama ada di validateForm
            newValue = value; // Tetap simpan string yang tidak valid
          }
        }
        return { ...item, [field]: newValue };
      }
      return item;
    });
    setPrices(updatedPrices);
  };

  const removeSizePrice = (index) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  // --- Fungsi Validasi Form Utama ---
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Nama produk wajib diisi.";
    }
    if (!description.trim()) {
      errors.description = "Deskripsi produk wajib diisi.";
    }
    if (!selectedCategoryId) {
      errors.category = "Kategori produk wajib dipilih.";
    }
    if (!image) {
      errors.image = "Gambar produk wajib diunggah.";
    }
    if (!adminId) {
      errors.adminId = "ID Admin tidak ada. Harap login kembali.";
    }

    // Validasi Harga/Ukuran/Berat
    if (prices.length === 0) {
      errors.prices = "Produk harus memiliki setidaknya satu ukuran, harga, dan berat.";
    } else {
      const priceErrors = prices.map((item, index) => {
        const itemErrors = {};
        const trimmedSize = item.size.trim().toUpperCase(); // Normalisasi ukuran ke UPPERCASE

        // Validasi Ukuran: Harus ada di ALLOWED_SIZES
        if (!trimmedSize) {
          itemErrors.size = `Ukuran untuk entri #${index + 1} wajib diisi.`;
        } else if (!ALLOWED_SIZES.includes(trimmedSize)) {
          itemErrors.size = `Ukuran untuk entri #${index + 1} harus salah satu dari: ${ALLOWED_SIZES.join(', ')}.`;
        }
        
        const priceNum = parseFloat(item.price);
        if (isNaN(priceNum) || priceNum < 0) { // Pastikan tidak negatif
          itemErrors.price = `Harga untuk entri #${index + 1} harus berupa angka positif.`;
        }
        const weightNum = parseFloat(item.weight);
        if (isNaN(weightNum) || weightNum < 0) { // Pastikan tidak negatif
          itemErrors.weight = `Berat untuk entri #${index + 1} harus berupa angka positif.`;
        }
        return Object.keys(itemErrors).length > 0 ? itemErrors : null;
      }).filter(Boolean);

      if (priceErrors.length > 0) {
        errors.pricesDetail = priceErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      Object.values(formErrors).forEach(err => {
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
      formData.append("image", image);
      formData.append("popular", popular);
      formData.append("adminId", adminId);
      // Normalisasi ukuran ke UPPERCASE sebelum dikirim ke backend
      formData.append("prices", JSON.stringify(prices.map(item => ({
        size: item.size.trim().toUpperCase(), // Normalisasi ukuran di sini
        price: parseFloat(item.price),
        weight: parseFloat(item.weight),
      }))));
      formData.append("categoryId", selectedCategoryId);

      const response = await api.post("/api/product", formData);

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrices([]);
        setImage(null);
        setPopular(false);
        setFormErrors({});
        if (categories.length > 0) {
          setSelectedCategoryId(categories[0]._id);
        } else {
          setSelectedCategoryId("");
        }
        navigate("/products");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.message || "Gagal menambahkan produk. Cek log server.");
    }
  };

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Add Product page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/products">
          Products
        </Breadcrumb.Item>
        <Breadcrumb.Item>Add Product</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Tambah Produk Baru</h2>

      {/* Modern Card Container for the Form */}
      <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
              } ${formErrors.name ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Deskripsi Produk
            </label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={4}
              id="description"
              placeholder="Deskripsi Produk"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              } ${formErrors.description ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Kategori
            </label>
            <select
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              value={selectedCategoryId}
              id="category"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
              } ${formErrors.category ? 'border-red-500' : ''}`}
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

          {/* Image Upload */}
          <div>
            <h5 className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Gambar Produk
            </h5>
            <label htmlFor="image-upload" className="cursor-pointer mt-1 block">
              <img
                src={image ? URL.createObjectURL(image) : upload_icon}
                alt="Upload Icon"
                className={`w-24 h-24 object-cover ring-1 ring-slate-900/5 rounded-lg shadow-sm ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } ${formErrors.image ? 'border-2 border-red-500' : ''}`}
              />
              <input
                type="file"
                onChange={handleImageChange}
                name="image"
                id="image-upload"
                hidden
                required
              />
            </label>
            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
          </div>

          {/* Size and Pricing (Dynamic Fields) */}
          <div className="md:col-span-2">
            <h5 className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  min={0} // Tambahkan atribut min
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
                  min={0} // Tambahkan atribut min
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
            {formErrors.pricesDetail && formErrors.pricesDetail.map((err, idx) => (
              Object.values(err).map((msg, i) => (
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
              <Package size={18} className="mr-2" /> Tambah Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
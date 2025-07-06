// src/routes/categories/add.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { ImagePlus, Loader2, Home, Package } from "lucide-react"; // Import Home, Package icons
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Use the theme hook

  // State untuk data form kategori
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // Menyimpan objek File gambar
  const [imagePreview, setImagePreview] = useState(null); // Menyimpan URL untuk preview gambar

  const [isLoading, setIsLoading] = useState(false); // State untuk loading saat submit
  const [formErrors, setFormErrors] = useState({}); // State untuk error validasi

  // Ref untuk input file agar bisa dipicu secara programatis
  const imageInputRef = useRef(null);

  // Handler saat file gambar dipilih
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Anda bisa menambahkan validasi ukuran file di sini jika perlu, contoh:
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Ukuran file maksimal 2MB.");
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setFormErrors(prev => ({ ...prev, image: "Ukuran file maksimal 2MB." }));
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Buat URL objek untuk preview
      setFormErrors(prev => ({ ...prev, image: undefined })); // Hapus error gambar jika valid
    } else {
      setImage(null);
      setImagePreview(null);
      setFormErrors(prev => ({ ...prev, image: "Gambar kategori wajib diisi!" })); // Atur error jika tidak ada file
    }
  };

  // --- Fungsi Validasi Form Utama ---
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Nama kategori wajib diisi.";
    }
    if (!image) { // Periksa apakah gambar ada (File object)
      errors.image = "Gambar kategori wajib diunggah.";
    }
    // Deskripsi tidak wajib, jadi tidak perlu divalidasi kekosongannya

    setFormErrors(errors); // Update state error

    // Kembalikan true jika tidak ada error
    return Object.keys(errors).length === 0;
  };

  // Handler saat form disubmit
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const isValid = validateForm(); // Panggil fungsi validasi

    if (!isValid) {
      // Tampilkan semua error menggunakan toast
      Object.values(formErrors).forEach(err => {
        toast.error(err);
      });
      toast.error("Mohon perbaiki kesalahan dalam formulir.");
      return;
    }

    setIsLoading(true);

    // Buat FormData untuk mengirim file dan data teks
    const formData = new FormData();
    formData.append("name", name.trim()); // Pastikan nama sudah di-trim
    formData.append("description", description.trim()); // Deskripsi juga di-trim
    formData.append("image", image); 

    try {
      const response = await api.post("/api/categories", formData);

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form setelah sukses
        setName("");
        setDescription("");
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setFormErrors({}); // Bersihkan error setelah sukses
        navigate("/categories"); // Arahkan kembali ke daftar kategori
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Gagal menambahkan kategori. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk tombol batal
  const handleCancel = () => {
    navigate("/categories");
  };

  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Add Category page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/categories">
          Categories
        </Breadcrumb.Item>
        <Breadcrumb.Item>Add Category</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Tambah Kategori Baru</h2>

      {/* Modern Card Container for the Form */}
      <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Nama Kategori */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormErrors(prev => ({ ...prev, name: undefined })); // Clear error on change
              }}
              className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              } ${formErrors.name ? 'border-red-500' : ''}`} // Styling error
              placeholder="Masukkan nama kategori"
              required
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          {/* Input Deskripsi Kategori */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className={`p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="Masukkan deskripsi kategori (opsional)"
            ></textarea>
          </div>

          {/* Input Gambar Kategori */}
          <div className="md:col-span-2"> {/* Spans two columns for better layout */}
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Gambar Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden" // Sembunyikan input file asli
              required
            />
            {/* Custom button untuk input file */}
            <div
              className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 
                ${imagePreview ? 'border-gray-400' : 'border-gray-300'}
                ${formErrors.image ? 'border-red-500' : ''}
                ${theme === 'dark' ? 'hover:bg-gray-700 bg-gray-900' : 'hover:bg-gray-50 bg-white'}`}
              onClick={() => imageInputRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
              ) : (
                <>
                  <ImagePlus size={48} className={`mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Klik untuk memilih gambar</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>(Maks. ukuran file: 2MB)</p>
                </>
              )}
            </div>
            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = ''; // Reset input file
                  setFormErrors(prev => ({ ...prev, image: "Gambar kategori wajib diunggah." })); // Atur error setelah dihapus
                }}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Hapus Gambar
              </button>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="md:col-span-2 flex justify-end gap-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-2 rounded-lg transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Mengirim...
                </>
              ) : (
                "Tambah Kategori"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryPage;
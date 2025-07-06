// src/routes/categories/update.jsx
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, Loader2, Home, Package } from "lucide-react"; // Import Home, Package icons
import { Breadcrumb } from "flowbite-react"; // Import Breadcrumb
import { useTheme } from "@/hooks/use-theme"; // Import useTheme hook

const UpdateCategoryPage = () => { // Nama komponen diubah jadi 'UpdateCategoryPage'
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID kategori dari URL
  const { theme } = useTheme(); // Use the theme hook

  // State untuk data form kategori
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // Menyimpan objek File gambar (jika diunggah baru)
  const [imagePreview, setImagePreview] = useState(null); // Menyimpan URL untuk preview (bisa URL lama atau baru)
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL gambar yang sudah ada dari backend

  const [isLoadingData, setIsLoadingData] = useState(true); // State untuk loading data awal
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading saat submit form
  const [formErrors, setFormErrors] = useState({}); // State untuk error validasi

  // Ref untuk input file agar bisa dipicu secara programatis
  const imageInputRef = useRef(null);

  // --- Effect hook untuk mengambil data kategori saat komponen dimuat atau ID berubah ---
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoadingData(true);
        setFormErrors({}); // Bersihkan error saat memuat data baru
        const response = await api.get(`/api/categories/${id}`);
        if (response.data.success && response.data.data) {
          const category = response.data.data;
          setName(category.name);
          setDescription(category.description || "");
          setCurrentImageUrl(category.image || null); // Simpan URL gambar yang ada
          setImagePreview(category.image || null); // Tampilkan gambar yang ada sebagai preview awal
        } else {
          toast.error(response.data.message || "Data kategori tidak ditemukan.");
          navigate("/categories"); // Alihkan jika kategori tidak ditemukan
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        const errorMessage = err.response?.data?.message || "Gagal mengambil data kategori.";
        toast.error(errorMessage);
        navigate("/categories"); // Alihkan jika terjadi error saat fetching
      } finally {
        setIsLoadingData(false); // Selesai loading data
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id, navigate]); // Dependensi: effect akan berjalan ulang jika ID di URL atau navigate berubah

  // --- Handler saat file gambar dipilih ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (misalnya, maks 2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Ukuran file maksimal 2MB.");
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setFormErrors(prev => ({ ...prev, image: "Ukuran file maksimal 2MB." }));
        return;
      }

      setImage(file); // Set file baru
      setImagePreview(URL.createObjectURL(file)); // Buat URL objek untuk preview
      setFormErrors(prev => ({ ...prev, image: undefined })); // Hapus error gambar jika valid
    } else {
      // Jika pengguna membatalkan pemilihan file, kembalikan ke gambar yang ada atau kosong
      setImage(null); // Penting: ini menandakan tidak ada file baru yang diupload
      setImagePreview(currentImageUrl); // Kembali ke gambar lama sebagai preview
      // Jika currentImageUrl juga null, berarti memang tidak ada gambar. Validasi akan menangani ini.
      // setFormErrors(prev => ({ ...prev, image: "Gambar kategori wajib diisi!" })); // Tidak perlu set error di sini, validasi form utama yang akan cek
    }
  };

  // --- Fungsi Validasi Form Utama ---
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Nama kategori wajib diisi.";
    }

    // Validasi gambar:
    // Cek apakah ada gambar (File object) ATAU ada currentImageUrl (string dari backend)
    if (!image && !currentImageUrl) {
      errors.image = "Gambar kategori wajib diunggah atau dipertahankan.";
    }

    setFormErrors(errors); // Update state error

    return Object.keys(errors).length === 0; // Kembalikan true jika tidak ada error
  };

  // --- Handler saat form disubmit ---
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const isValid = validateForm(); // Panggil fungsi validasi

    if (!isValid) {
      Object.values(formErrors).forEach(err => {
        toast.error(err);
      });
      toast.error("Mohon perbaiki kesalahan dalam formulir.");
      return;
    }

    setIsSubmitting(true);

    // Buat FormData untuk mengirim file dan data teks
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());

    // Hanya tambahkan gambar ke FormData jika ada gambar baru yang dipilih (berupa File object)
    if (image instanceof File) {
      formData.append("image", image);
    } else if (!currentImageUrl) {
        // Jika tidak ada gambar baru DAN currentImageUrl juga null, berarti gambar telah dihapus sepenuhnya
        // Anda mungkin perlu mengirim flag ke backend untuk menghapus gambar
        formData.append("image", ""); // Kirim string kosong atau flag khusus untuk backend
    }
    // Jika 'image' adalah null tapi 'currentImageUrl' ada, berarti ingin mempertahankan gambar lama, jadi tidak perlu append 'image'

    try {
      // Gunakan metode PUT untuk update, kirim ID di URL
      const response = await api.put(`/api/categories/${id}`, formData);

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/categories"); // Navigasi kembali ke daftar kategori
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMessage = err.response?.data?.message || "Gagal memperbarui kategori. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); // Akhiri loading submit
    }
  };

  // --- Handler untuk tombol batal ---
  const handleCancel = () => {
    navigate("/categories");
  };

  // --- Tampilan Loading Data Awal ---
  if (isLoadingData) {
    return (
      <div className={`flex justify-center items-center h-40 ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
        <Loader2 size={32} className="animate-spin mr-2" />
        <p className="text-lg">Memuat data kategori...</p>
      </div>
    );
  }

  // --- Tampilan Error Data Awal (Jika kategori tidak ditemukan atau error fetching) ---
  // Setelah navigate("/categories") di useEffect, bagian ini mungkin tidak akan ter-render
  // Tapi tetap baik sebagai fallback atau untuk debugging
  // if (fetchError) { // fetchError state removed, replaced with direct navigation
  //   return (
  //     <div className="flex justify-center items-center h-40">
  //       <p className="text-lg text-red-500">Error: {fetchError}</p>
  //     </div>
  //   );
  // }


  // --- Tampilan Form Utama ---
  return (
    <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Breadcrumb */}
      <Breadcrumb aria-label="Update Category page breadcrumb" className="mb-4">
        <Breadcrumb.Item href="/" icon={Home}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/categories">
          Categories
        </Breadcrumb.Item>
        <Breadcrumb.Item>Update Category</Breadcrumb.Item>
      </Breadcrumb>
      {/* --- */}

      <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Perbarui Kategori</h2>

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
                  <p className={`text-gray-400 text-xs`}>
                    {currentImageUrl ? "(Biarkan kosong untuk mempertahankan gambar yang sudah ada)" : "(Maks. ukuran file: 2MB)"}
                  </p>
                </>
              )}
            </div>
            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
            {(imagePreview || currentImageUrl) && ( // Tampilkan tombol hapus jika ada preview atau gambar lama
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null); // Hapus preview
                  setCurrentImageUrl(null); // Juga reset URL gambar lama jika dihapus sepenuhnya
                  if (imageInputRef.current) imageInputRef.current.value = ''; // Reset input file
                  setFormErrors(prev => ({ ...prev, image: "Gambar kategori wajib diunggah." })); // Atur error setelah dihapus
                }}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Hapus Gambar (termasuk yang sudah ada)
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Memperbarui...
                </>
              ) : (
                "Perbarui Kategori"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategoryPage;
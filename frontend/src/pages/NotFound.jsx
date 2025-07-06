// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 py-8"> {/* min-h untuk mengisi sisa layar setelah header */}
      <h1 className="text-6xl md:text-8xl font-extrabold text-red-600 mb-4 animate-pulse"> {/* Perbesar dan tambahkan animasi */}
        404
      </h1>
      <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
        Halaman Tidak Ditemukan
      </p>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        Maaf, halaman yang Anda cari tidak tersedia.
      </p>
      
      {/* Tombol yang lebih menonjol */}
      <Link 
        to="/" 
        className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Kembali ke Beranda
      </Link>

      {/* Opsional: Tambahkan link lain atau ikon/ilustrasi */}
      <div className="mt-8 text-gray-500 text-sm">
        <p>Anda mungkin ingin mencoba:</p>
        <ul className="list-disc list-inside mt-2">
          <li><Link to="/menu" className="text-blue-600 hover:underline">Melihat Menu Kami</Link></li>
          <li><Link to="/contact" className="text-blue-600 hover:underline">Menghubungi Kami</Link></li>
        </ul>
      </div>

      {/* Opsional: Ikon atau Ilustrasi */}
      {/* <img src="/path/to/your/404-illustration.svg" alt="Page Not Found" className="w-64 h-64 mt-8" /> */}
    </div>
  );
};

export default NotFound;
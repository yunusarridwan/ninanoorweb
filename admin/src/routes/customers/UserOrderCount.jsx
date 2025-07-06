import { useEffect, useState } from "react";
import api from "@/utils/api";

const UserOrderCount = ({ userId }) => {
  // Menggunakan null sebagai inisial untuk menunjukkan loading state
  // dan objek kosong {} jika tidak ada data atau terjadi error
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const fetchOrderCounts = async () => {
      // Set counts ke null setiap kali userId berubah untuk menampilkan "Loading..."
      setCounts(null);
      try {
        // Endpoint ini diasumsikan ada di backend Anda
        // Perlu dipastikan path '/api/order/status-count/:userId' benar di backend
        const res = await api.get(`/api/order/status-count/${userId}`);
        // Asumsi backend mengirim data counts di res.data.data
        // Contoh: { "data": { "Paid": 5, "Menunggu Pembayaran": 2 } }
        setCounts(res.data.data);
      } catch (error) {
        console.error(`Error fetching order counts for user ${userId}:`, error);
        // Set ke objek kosong agar tidak error jika tidak ada data atau ada masalah
        setCounts({});
      }
    };

    if (userId) {
      // Pastikan userId ada sebelum memuat data
      fetchOrderCounts();
    }
  }, [userId]); // Dependensi userId agar data dimuat ulang jika userId berubah

  // Tampilkan loading state
  if (counts === null) {
    return <span className="text-gray-400 text-sm">Loading...</span>;
  }
  const statusList = [
    { key: "Menunggu Pembayaran", label: "🕒 Menunggu", bg: "bg-yellow-500", text: "text-white" },
    { key: "Paid", label: "✅ Pembayaran Dikonfirmasi", bg: "bg-green-500", text: "text-white" }, // INI YANG BENAR
    { key: "Proses", label: "⚙️ Diproses", bg: "bg-blue-500", text: "text-white" }, // INI YANG BENAR
    { key: "Pengiriman", label: "🚚 Sedang Dikirim", bg: "bg-indigo-500", text: "text-white" }, // INI YANG BENAR
    { key: "Selesai", label: "✔️ Selesai", bg: "bg-gray-500", text: "text-white" },
    { key: "Dibatalkan", label: "❌ Dibatalkan", bg: "bg-red-500", text: "text-white" },
    { key: "Gagal", label: "🚫 Gagal", bg: "bg-red-700", text: "text-white" },
  ];
  
  // Fungsi pembantu untuk membuat badge status
  const StatusBadge = ({ label, count, bgColor, textColor }) => (
    <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
      {label}: {count}
    </span>
  );

  // Hitung total pesanan untuk menentukan apakah ada pesanan sama sekali
  const totalOrders = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="flex flex-wrap gap-2">
      {totalOrders > 0 ? (
        // Render badge hanya jika ada pesanan untuk status tertentu
        statusList.map(({ key, label, bg, text }) =>
          counts[key] > 0 ? (
            <StatusBadge
              key={key}
              label={label}
              count={counts[key]}
              bgColor={bg}
              textColor={text}
            />
          ) : null
        )
      ) : (
        // Tampilkan pesan jika tidak ada pesanan sama sekali
        <span className="text-gray-500 text-sm">Tidak ada pesanan</span>
      )}
    </div>
  );
};

export default UserOrderCount;

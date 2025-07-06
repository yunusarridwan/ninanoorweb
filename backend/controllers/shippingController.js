import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Memuat variabel lingkungan dari .env

// Pastikan untuk mendapatkan API Key dari variabel lingkungan
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
// Base URL RajaOngkir yang Anda gunakan dari kode sebelumnya
const RAJAONGKIR_KOMERCE_BASE_URL = "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";

const getRajaOngkirCityId = async (inputIdentifier) => {
    // --- LOGIKA MAPPING ID WILAYAH.ID KE ID RAJAONGKIR ---
    // Ini adalah dummy lookup. Dalam aplikasi nyata, Anda akan:
    // 1. Memiliki database lokal dengan mapping ID kota Wilayah.id ke ID kota RajaOngkir.
    // 2. Atau, jika frontend mengirim `nama_kota`, Anda akan memanggil API /city RajaOngkir
    //    untuk mencari ID kota berdasarkan nama. Ini bisa lambat.

    // Contoh sederhana: Jika inputIdentifier adalah kode pos, kita bisa coba cari kota RajaOngkir
    // yang memiliki kode pos itu. Namun, RajaOngkir API Starter/Basic tidak selalu menyertakan kodepos
    // di daftar kotanya, dan satu kodepos bisa mencakup beberapa kota.
    
    // Asumsi: Kita sedang menggunakan RajaOngkir Komarce.id, yang mungkin memiliki endpoint yang lebih ramah.
    // Tetapi secara umum, RajaOngkir inti memerlukan ID Kota/Kabupaten/Kecamatan.
    // Mari kita asumsikan untuk sementara bahwa `destination` yang diterima adalah ID kota RajaOngkir
    // atau Anda akan menambahkan database mapping untuk ini.
    
    // Jika Anda ingin lookup berdasarkan ZIPCODE melalui RajaOngkir Komarce.id (jika mereka mendukung)
    // atau RajaOngkir API City, Anda perlu kode di sini.
    // Untuk saat ini, kita akan asumsikan frontend sudah mengirimkan ID kota/kabupaten RajaOngkir yang benar.
    // ATAU, jika `destination` yang dikirim frontend adalah KODE POS, Anda perlu:
    // 1. Ambil daftar kota dari RajaOngkir, lalu cari kota yang sesuai dengan kode pos.
    // 2. Cara paling robust: Frontend harus mengirimkan ID kota RajaOngkir yang sudah di-mapping.

    // Untuk sementara, kita akan return inputIdentifier as it is, assuming it's the correct RajaOngkir City ID.
    // ANDA HARUS MENGUBAH INI JIKA `destination` DARI FRONTEND BUKAN ID RAJAONGKIR.
    return inputIdentifier; 
};


const cekOngkir = async (req, res) => {
    try {
        console.log("Request Body for cekOngkir:", req.body); // Log request body

        const { origin, destination, weight, courier } = req.body;
        // 'origin' harusnya ID kota asal RajaOngkir (contoh: 22 untuk Bekasi, jika toko Anda di Bekasi)
        // 'destination' harusnya ID kota tujuan RajaOngkir

        // Validasi input
        if (!origin || !destination || !weight || !courier) {
            return res.status(400).json({ success: false, message: "Origin, destination, weight, and courier are required." });
        }

        // Jika `destination` dari frontend adalah kode pos dari Wilayah.id,
        // Anda perlu mengonversinya menjadi ID kota/kabupaten RajaOngkir.
        // Fungsi `getRajaOngkirCityId` di atas adalah tempat untuk melakukan ini.
        const rajaOngkirDestinationId = await getRajaOngkirCityId(destination); // destination dari frontend bisa jadi zipcode

        if (!rajaOngkirDestinationId) {
            return res.status(400).json({ success: false, message: "Kota tujuan tidak dapat diidentifikasi untuk perhitungan ongkir." });
        }

        const response = await axios.post(
            RAJAONGKIR_KOMERCE_BASE_URL,
            new URLSearchParams({ 
                origin: origin, // ID kota asal RajaOngkir (misal: "22" untuk Bekasi)
                destination: rajaOngkirDestinationId, // ID kota tujuan RajaOngkir
                weight: weight, // dalam gram
                courier: courier // 'jne', 'pos', 'tiki', dll.
            }),
            {
                headers: {
                    key: RAJAONGKIR_API_KEY, // Gunakan API Key dari .env
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const data = response.data;
        if (data.data && data.data.length > 0) {
            // RajaOngkir Komarce.id mungkin sudah mengembalikan yang termurah,
            // atau Anda masih perlu mereduksi jika ada beberapa opsi dalam `data.data`
            const cheapestService = data.data.reduce((prev, curr) =>
                prev.cost < curr.cost ? prev : curr
            );
            return res.json({ success: true, cheapestService });
        } else {
            return res.json({ success: false, message: "Tidak ada data ongkir tersedia untuk rute ini." });
        }
    } catch (error) {
        console.error("Error checking shipping cost:", error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || "Internal Server Error during shipping cost calculation.",
        });
    }
};

export { cekOngkir };
import axios from 'axios';

// Base URL untuk API wilayah.id yang Anda gunakan
const WILAYAH_BASE_URL = 'https://wilayah.id/api';

/**
 * Mengambil daftar provinsi dari API wilayah.id.
 * Respon dari wilayah.id adalah objek: { "data": [{ "code": "...", "name": "..." }, ...], "meta": { ... } }
 */
const getProvinces = async (req, res) => {
    try {
        const response = await axios.get(`${WILAYAH_BASE_URL}/provinces.json`);
        // Mengembalikan seluruh objek respons dari API eksternal, termasuk properti 'data'.
        // Frontend yang akan mengekstrak response.data.data.
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching provinces from wilayah.id:", error.message);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar provinsi." });
    }
};

/**
 * Mengambil daftar kabupaten/kota berdasarkan kode provinsi dari API wilayah.id.
 * Respon dari wilayah.id adalah objek: { "data": [{ "code": "...", "name": "..." }, ...], "meta": { ... } }
 */
const getRegencies = async (req, res) => {
    const { provinceId } = req.params; // provinceId di sini sebenarnya adalah 'code' provinsi
    try {
        const response = await axios.get(`${WILAYAH_BASE_URL}/regencies/${provinceId}.json`);
        // Mengembalikan seluruh objek respons dari API eksternal.
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching regencies for province ${provinceId} from wilayah.id:`, error.message);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar kabupaten/kota." });
    }
};

/**
 * Mengambil daftar kecamatan berdasarkan kode kabupaten/kota dari API wilayah.id.
 * Respon dari wilayah.id adalah objek: { "data": [{ "code": "...", "name": "..." }, ...], "meta": { ... } }
 */
const getDistricts = async (req, res) => {
    const { regencyId } = req.params; // regencyId di sini sebenarnya adalah 'code' kabupaten/kota
    try {
        const response = await axios.get(`${WILAYAH_BASE_URL}/districts/${regencyId}.json`);
        // Mengembalikan seluruh objek respons dari API eksternal.
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching districts for regency ${regencyId} from wilayah.id:`, error.message);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar kecamatan." });
    }
};

/**
 * Mengambil daftar kelurahan/desa berdasarkan kode kecamatan dari API wilayah.id.
 * Respon dari wilayah.id adalah objek: { "data": [{ "code": "...", "name": "...", "postal_code": "..." }, ...], "meta": { ... } }
 */
const getVillages = async (req, res) => {
    const { districtId } = req.params; // districtId di sini sebenarnya adalah 'code' kecamatan
    try {
        const response = await axios.get(`${WILAYAH_BASE_URL}/villages/${districtId}.json`);
        // Mengembalikan seluruh objek respons dari API eksternal.
        // Objek kelurahan di dalam 'data' akan memiliki properti 'postal_code'.
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error fetching villages for district ${districtId} from wilayah.id:`, error.message);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar kelurahan/desa." });
    }
};

export {
    getProvinces,
    getRegencies,
    getDistricts,
    getVillages
};
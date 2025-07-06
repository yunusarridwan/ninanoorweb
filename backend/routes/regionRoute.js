import express from 'express';
import {
    getProvinces,
    getRegencies,
    getDistricts,
    getVillages
} from '../controllers/wilayahController.js'; // Impor controller wilayah
import { cekOngkir } from '../controllers/shippingController.js'; // Impor controller ongkir

const regionRouter = express.Router();

// --- Rute untuk Wilayah.id ---
regionRouter.get('/provinsi', getProvinces);
regionRouter.get('/kabupaten/:provinceId', getRegencies);
regionRouter.get('/kecamatan/:regencyId', getDistricts);
regionRouter.get('/kelurahan/:districtId', getVillages);

// --- Rute untuk Cek Ongkir ---
regionRouter.post('/cek-ongkir', cekOngkir); // Ini adalah rute cek ongkir yang terpisah

export default regionRouter;
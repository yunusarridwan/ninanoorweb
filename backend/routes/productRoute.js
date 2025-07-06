import express from "express";
import {
  addProduct,
  listProduct,
  removeProduct,
  singleProduct,
  updateProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import requireAdmin from "../middleware/requireAdmin.js"; // Pastikan path ini benar
import auth from '../middleware/auth.js'; // <<< PASTIKAN ANDA MENGIMPOR MIDDLEWARE AUTH INI

const productRouter = express.Router();

// --- Product Routes ---

// Tambah produk (POST /api/products)
// Membutuhkan requireAdmin karena hanya admin yang bisa menambah produk
// PERBAIKAN: Tambahkan middleware 'auth' sebelum 'requireAdmin'
productRouter.post("/", auth, requireAdmin, upload.single("image"), addProduct);

// Ambil daftar semua produk (GET /api/products)
// Umumnya dapat diakses publik
productRouter.get("/", listProduct);

// Ambil detail produk berdasarkan ID (GET /api/products/:id)
// Umumnya dapat diakses publik, kecuali ada alasan khusus untuk admin-only
productRouter.get("/:id", singleProduct);

// Update produk berdasarkan ID (PUT /api/products/:id)
// Membutuhkan requireAdmin karena hanya admin yang bisa mengupdate produk
// PERBAIKAN: Tambahkan middleware 'auth' sebelum 'requireAdmin'
productRouter.put("/:id", auth, requireAdmin, upload.single("image"), updateProduct);

// Hapus produk berdasarkan ID (DELETE /api/products/:id)
// Membutuhkan requireAdmin karena hanya admin yang bisa menghapus produk
// PERBAIKAN: Tambahkan middleware 'auth' sebelum 'requireAdmin'
productRouter.delete("/:id", auth, requireAdmin, removeProduct);

export default productRouter;

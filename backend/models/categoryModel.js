// categoryModel.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Nama kategori harus unik
    trim: true, // Menghapus spasi di awal/akhir
  },
  description: {
    type: String,
    required: true, // Deskripsi bisa opsional
    trim: true,
  },
  image: {
    type: String, // URL gambar kategori
    required: true, // Anda bisa membuatnya required: true jika setiap kategori HARUS punya gambar
  },
  // --- END TAMBAHAN BARU ---
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Tipe ObjectId
    ref: 'Admin', // Referensi ke model 'Admin'
    required: false, // Bisa jadi opsional jika ingin fleksibilitas
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId, // Tipe ObjectId
    ref: 'Admin', // Referensi ke model 'Admin'
    required: false, // Akan diisi saat update
  },
}, {
  timestamps: true 
});

const categoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default categoryModel;
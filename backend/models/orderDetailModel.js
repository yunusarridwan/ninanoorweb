// orderDetailModel.js
import mongoose from "mongoose";

// Sub-skema untuk item dalam orderDetail (items)
const orderItemSchema = new mongoose.Schema({ 
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: { 
    type: String,
    required: false // Ubah ke true jika image wajib
  },
  size: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Sub-skema untuk alamat (street, city, province, zipcode, dll.)
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  village: { // TAMBAHKAN INI
      type: String,
      required: false,
      trim: true
  },
  district: { // TAMBAHKAN INI
      type: String,
      required: true, // Asumsi district wajib dari frontend
      trim: true
  },
  regency: { // TAMBAHKAN INI (ini adalah nama kota/kabupaten)
      type: String,
      required: true, // Asumsi regency wajib dari frontend
      trim: true
  },
  province: { // TAMBAHKAN INI
    type: String,
    required: true,
    trim: true
  },
  zipcode: {
    type: String,
    required: true,
    trim: true
  },
  // Hapus `city` jika `regency` akan digunakan sebagai nama kota/kabupaten
  // Atau, jika `city` adalah nama kota/kabupaten, pastikan frontend mengirim `city`
  // Berdasarkan payload: frontend mengirim `regency`, jadi `regency` harus ada di skema
});

const orderDetailSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientPhone: {
    type: String,
    required: true,
    trim: true
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  amount: { // Subtotal dari item-item dalam OrderDetail ini
    type: Number,
    required: true,
    min: 0
  },
  messageOrder: {
    type: String,
    default: 'tidak ada',
    trim: true
  },
  items: {
    type: [orderItemSchema], // Array dari sub-dokumen orderItemSchema
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Order must contain at least one item.'
    }
  },
}, {
  timestamps: true
});

const orderDetailModel = mongoose.models.OrderDetail || mongoose.model("OrderDetail", orderDetailSchema);
export default orderDetailModel;
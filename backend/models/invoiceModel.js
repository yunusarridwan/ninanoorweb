// models/invoiceModel.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  orderDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderDetail', // Merujuk ke model OrderDetail
    required: false,
    unique: true // Setiap OrderDetail hanya memiliki satu Invoice
  },

  specificPaymentMethod: { 
      type: String,
      required: false 
  },

  // payment_status
  paymentStatus: {
    type: String,
    // Tetapkan default ke 'Pending' untuk status awal belum dibayar
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending', // Ini memastikan status awal selalu 'Pending'
    required: true
  },

  // payment_date
  paymentDate: {
    type: Date,
    required: false,
    default: Date.now, 
  },

}, {
  timestamps: true 
});

const invoiceModel = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default invoiceModel;
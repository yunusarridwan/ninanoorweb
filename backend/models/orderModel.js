// orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveryDay = new Date(value);
        deliveryDay.setHours(0, 0, 0, 0);
        return deliveryDay >= today;
      },
      message: "Delivery date must be today or a future date."
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalWeight: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Menunggu Pembayaran',
      'Pembayaran Dikonfirmasi',
      'Diproses',
      'Dikirim',
      'Selesai',
      'Dibatalkan'
    ],
    default: 'Menunggu Pembayaran'
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default orderModel;
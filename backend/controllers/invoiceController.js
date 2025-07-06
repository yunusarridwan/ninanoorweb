// controllers/invoiceController.js

import orderModel from "../models/orderModel.js";
import orderDetailModel from "../models/orderDetailModel.js";
import userModel from "../models/userModel.js";
import invoiceModel from "../models/invoiceModel.js";
import midtransClient from "midtrans-client";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

// Midtrans gateway
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Konfigurasi Nodemailer (sisanya sama)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatRupiah = (angka) => `Rp ${angka.toLocaleString("id-ID")},00`;
const formatTanggalIndonesia = (tanggal) => {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const generateInvoiceHTML = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
        <h2 style="color: #2c3e50;">Ninanoor Bakeshop</h2>
        <h3 style="margin-bottom: 5px;">Invoice <span style="color: #2980b9;">${
          data.kodeInvoice
        }</span></h3>
        <p style="font-size: 14px; margin-top: 0;">Tanggal Pemesanan: ${
          data.tglPemesanan
        }</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <table width="100%" cellpadding="5" cellspacing="0" style="font-size: 14px;">
            <tr>
                <td valign="top" width="50%">
                    <strong>Informasi - Pemesan:</strong><br/>
                    Pemesan: ${data.pemesan}<br/>
                    Tanggal Pengiriman: ${data.tglPengiriman}<br/>
                </td>
                <td valign="top" width="50%">
                    <strong>Informasi Penerima:</strong><br/>
                    Penerima: ${data.penerima}<br/>
                    Telp: ${data.telpPenerima}<br/>
                    Alamat: ${data.alamatPengiriman}
                </td>
            </tr>
        </table>

        <h4 style="margin-top: 30px;">Detail Pesanan:</h4>
        <table width="100%" border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
            <thead style="background-color: #f8f8f8;">
                <tr>
                    <th align="left">Informasi Produk</th>
                    <th align="center">Jumlah</th>
                    <th align="right">Harga Satuan</th>
                    <th align="right">Total Harga</th>
                </tr>
            </thead>
            <tbody>
                ${data.items
                  .map(
                    (item) => `
                        <tr>
                            <td>${item.name} (${item.size || "N/A"})</td>
                            <td align="center">${item.quantity}</td>
                            <td align="right">${formatRupiah(item.price)}</td>
                            <td align="right">${formatRupiah(
                              item.totalPrice
                            )}</td>
                        </tr>
                    `
                  )
                  .join("")}
            </tbody>
        </table>

        <table width="100%" cellpadding="5" cellspacing="0" style="font-size: 14px; margin-top: 20px;">
            <tr>
                <td align="right" colspan="3"><strong>Sub Total Barang:</strong></td>
                <td align="right">${formatRupiah(data.subTotal)}</td>
            </tr>
            <tr>
                <td align="right" colspan="3"><strong>Total Ongkos Kirim:</strong></td>
                <td align="right">${formatRupiah(data.ongkosKirim)}</td>
            </tr>
            <tr>
                <td align="right" colspan="3"><h3 style="margin: 10px 0;">Total Belanja:</h3></td>
                <td align="right"><h3 style="margin: 10px 0;">${formatRupiah(
                  data.totalBelanja
                )}</h3></td>
            </tr>
        </table>

        <p style="font-size: 14px;"><strong>Metode Pembayaran:</strong> ${
          data.metodePembayaran
        }</p>
        <p style="font-size: 14px;"><strong>Catatan Order:</strong> ${
          data.messageOrder
        }</p>
        <p style="font-size: 14px;"><strong>Status Pembayaran:</strong> ${
          data.paymentStatus
        }</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <p style="font-size: 12px; color: #888;">
            Invoice ini sah dan diproses oleh komputer.<br/>
            Silakan hubungi Ninanoor Bakeshop apabila kamu membutuhkan bantuan.
        </p>
    </div>
    `;
};

const getMidtransToken = async (req, res) => {
  try {
    const { orderDetailId, frontendRedirectUrl } = req.body;
    console.log("Received orderDetailId:", orderDetailId);

    if (!orderDetailId || !mongoose.Types.ObjectId.isValid(orderDetailId)) {
      console.error("getMidtransToken: Validasi gagal untuk orderDetailId.");
      return res.status(400).json({
        success: false,
        message: "ID Detail Order tidak valid!",
      });
    }

    const orderDetail = await orderDetailModel.findById(orderDetailId);
    if (!orderDetail) {
      console.error(
        "getMidtransToken: Detail Order tidak ditemukan untuk ID:",
        orderDetailId
      );
      return res.status(404).json({
        success: false,
        message:
          "Detail pesanan tidak ditemukan untuk pembuatan token pembayaran!",
      });
    }

    const order = await orderModel.findById(orderDetail.orderId);
    if (!order) {
      console.error(
        "getMidtransToken: Order utama tidak ditemukan untuk OrderDetail ID:",
        orderDetail._id
      );
      return res.status(404).json({
        success: false,
        message: "Order utama tidak ditemukan untuk detail ini!",
      });
    }

    const invoice = await invoiceModel.findOne({
      orderDetailId: orderDetail._id,
    });
    if (!invoice) {
      console.error(
        "getMidtransToken: Invoice tidak ditemukan untuk OrderDetail ID:",
        orderDetail._id
      );
      return res.status(404).json({
        success: false,
        message: "Invoice tidak ditemukan untuk pesanan ini!",
      });
    }

    const user = await userModel.findById(order.userId);
    if (!user) {
      console.error(
        "getMidtransToken: User tidak ditemukan untuk User ID:",
        order.userId
      );
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan untuk order ini!",
      });
    }

    const midtransTransactionTimestamp = invoice.createdAt.getTime();

    const midtransItemDetails = orderDetail.items.map((item) => ({
      id: item.productId ? item.productId.toString() : "UNKNOWN_PRODUCT",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: "Produk Bakeshop",
    }));

    if (orderDetail.shippingCost > 0) {
      midtransItemDetails.push({
        id: "shipping_cost",
        name: "Biaya Pengiriman",
        price: orderDetail.shippingCost,
        quantity: 1,
        category: "Biaya Layanan",
      });
    }

    const parameter = {
      transaction_details: {
        order_id: `INV-${invoice._id}-${midtransTransactionTimestamp}`,
        gross_amount: order.totalAmount,
      },
      item_details: midtransItemDetails,
      customer_details: {
        first_name: user.username,
        email: user.email,
        phone: orderDetail.recipientPhone,
        shipping_address: {
          first_name: orderDetail.recipientName,
          phone: orderDetail.recipientPhone,
          address: `${orderDetail.address.street}, Kel. ${orderDetail.address.village}, Kec. ${orderDetail.address.district}`,
          city: orderDetail.address.regency,
          postal_code: orderDetail.address.zipcode,
          country_code: "IDN",
        },
      },
      callbacks: {
        // Gunakan URL yang sama dengan yang dikirim dari frontend untuk redirect
        finish: `${frontendRedirectUrl}?invoiceId=${invoice._id}&orderId=${order._id}&midtransTs=${midtransTransactionTimestamp}`,
        error: `${frontendRedirectUrl}?status=failed&invoiceId=${invoice._id}&orderId=${order._id}&midtransTs=${midtransTransactionTimestamp}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    if (!transaction.token) {
      console.error("getMidtransToken: Midtrans tidak mengembalikan token.");
      return res
        .status(500)
        .json({ success: false, message: "Token pembayaran tidak ditemukan!" });
    }

    res.json({
      success: true,
      token: transaction.token,
      invoiceId: invoice._id, // Kirim invoiceId
      orderId: order._id, // Kirim orderId
      midtransTs: midtransTransactionTimestamp, // Kirim timestamp untuk check status nanti
    });
  } catch (error) {
    console.error("Midtrans API Error in getMidtransToken:", error);
    const simpleError = {};
    if (error instanceof Error) {
      simpleError.name = error.name;
      simpleError.message = error.message;
      if (error.ApiResponse) {
        simpleError.apiResponse = error.ApiResponse;
      }
    } else {
      simpleError.message = "An unknown error occurred.";
    }
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan token pembayaran!",
      error: simpleError,
    });
  }
};

const handleMidtransNotification = async (req, res) => {
  // Karena Anda tidak ingin menggunakan webhook, fungsi ini tidak akan mengubah DB
  console.log(
    "Midtrans Notification Received (Webhook diabaikan, update dari frontend):",
    req.body
  );
  res.status(200).send("OK"); // Tetap kirim OK ke Midtrans untuk menghindari notifikasi berulang
};

const sendInvoiceEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Order tidak valid!" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order tidak ditemukan!" });
    }

    const orderDetail = await orderDetailModel.findOne({ orderId: order._id });
    if (!orderDetail) {
      return res.status(404).json({
        success: false,
        message: "Detail Order tidak ditemukan untuk order ini!",
      });
    }

    const invoice = await invoiceModel.findOne({
      orderDetailId: orderDetail._id,
    });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice tidak ditemukan untuk order ini!",
      });
    }

    const user = await userModel.findById(order.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan!" });
    }

    const deliveryAddress = orderDetail.address;
    const formattedAddress = deliveryAddress
      ? `${deliveryAddress.street || "N/A"}, ${
          deliveryAddress.village || "N/A"
        },${deliveryAddress.district || "N/A"},${
          deliveryAddress.regency || "N/A"
        }, ${deliveryAddress.province || "N/A"} ${
          deliveryAddress.zipcode || "N/A"
        }`
      : "Alamat tidak tersedia";

    const displayPaymentMethod = invoice.specificPaymentMethod
      ? invoice.specificPaymentMethod.replace(/_/g, " ").toUpperCase()
      : invoice.paymentMethod;

    const invoiceData = {
      kodeInvoice: `INV-${invoice._id}`,
      pemesan: user.username || "Undefined",
      email: user.email || "Undefined",
      tglPemesanan: formatTanggalIndonesia(order.orderDate),
      tglPengiriman: formatTanggalIndonesia(order.deliveryDate),
      penerima: orderDetail.recipientName || "Undefined",
      telpPenerima: orderDetail.recipientPhone || "Undefined",
      alamatPengiriman: formattedAddress,
      items: orderDetail.items.map((item) => ({
        name: item.name || "N/A",
        size: item.size || "N/A",
        quantity: item.quantity || 0,
        price: item.price || 0,
        totalPrice: item.totalPrice || 0,
      })),
      subTotal: orderDetail.amount || 0,
      ongkosKirim: orderDetail.shippingCost || 0,
      totalBelanja: order.totalAmount || 0,
      metodePembayaran: displayPaymentMethod,
      messageOrder: orderDetail.messageOrder || "Tidak ada",
      paymentStatus: invoice.paymentStatus, // Ambil dari invoice
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Invoice ${invoiceData.kodeInvoice} - Ninanoor Bakeshop`,
      html: generateInvoiceHTML(invoiceData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email terkirim:", info.response);

    res
      .status(200)
      .json({ success: true, message: "Invoice email berhasil dikirim." });
  } catch (error) {
    console.error("❌ Error sending invoice email:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengirim email invoice." });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Invoice tidak valid!" });
    }

    const invoice = await invoiceModel.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice tidak ditemukan." });
    }

    const orderDetail = await orderDetailModel
      .findById(invoice.orderDetailId)
      .populate({
        path: "orderId",
        model: "Order",
      })
      .populate("items.productId");

    res.status(200).json({
      success: true,
      invoice: invoice.toObject(),
      orderDetail: orderDetail ? orderDetail.toObject() : null,
    });
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoiceByOrderDetailId = async (req, res) => {
  try {
    const { orderDetailId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderDetailId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Detail Order tidak valid!" });
    }

    const invoice = await invoiceModel.findOne({
      orderDetailId: orderDetailId,
    });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice tidak ditemukan untuk detail order ini.",
      });
    }

    const orderDetail = await orderDetailModel
      .findById(invoice.orderDetailId)
      .populate({
        path: "orderId",
        model: "Order",
      })
      .populate("items.productId");

    const order = orderDetail?.orderId;
    const user = order ? await userModel.findById(order.userId) : null;
    const displayPaymentMethod = invoice.specificPaymentMethod
      ? invoice.specificPaymentMethod.replace(/_/g, " ").toUpperCase()
      : invoice.paymentMethod;

    const formattedInvoiceData = {
      kodeInvoice: `INV-${invoice._id}`,
      pemesan: user?.username || "Undefined",
      email: user?.email || "Undefined",
      tglPemesanan: formatTanggalIndonesia(order?.orderDate),
      tglPengiriman: formatTanggalIndonesia(order?.deliveryDate),
      penerima: orderDetail?.recipientName || "Undefined",
      telpPenerima: orderDetail?.recipientPhone || "Undefined",
      alamatPengiriman: orderDetail?.address
        ? `${orderDetail.address.street || "N/A"}, ${
            orderDetail.address.village || "N/A"
          }, ${orderDetail.address.district || "N/A"},
                 ${orderDetail.address.regency || "N/A"},  ${
            orderDetail.address.province || "N/A"
          } ${orderDetail.address.zipcode || "N/A"}`
        : "Alamat tidak tersedia",
      items:
        orderDetail?.items.map((item) => ({
          name: item.name || "N/A",
          size: item.size || "N/A",
          quantity: item.quantity || 0,
          price: item.price || 0,
          totalPrice: item.totalPrice || 0,
        })) || [],
      subTotal: orderDetail?.amount || 0,
      ongkosKirim: orderDetail?.shippingCost || 0,
      totalBelanja: order?.totalAmount || 0,
      metodePembayaran: displayPaymentMethod,
      messageOrder: orderDetail?.messageOrder || "Tidak ada",
      paymentStatus: invoice.paymentStatus,
    };
    res.status(200).json({ success: true, invoiceData: formattedInvoiceData });
  } catch (error) {
    console.error("Error fetching invoice by orderDetailId:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Check Midtrans transaction status and update database
 * @route POST /api/invoice/check-status
 * @access Private (Auth user)
 */
const checkMidtransTransactionStatus = async (req, res) => {
  try {
    const { invoiceId, orderId, midtransTs } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(invoiceId) ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID Invoice atau Order tidak valid!",
      });
    }

    const invoice = await invoiceModel.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice tidak ditemukan." });
    }

    const orderDetail = await orderDetailModel.findById(invoice.orderDetailId);
    if (!orderDetail) {
      return res.status(404).json({
        success: false,
        message: "Detail pesanan tidak ditemukan untuk invoice ini.",
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order tidak ditemukan." });
    }

    // Rekonstruksi order_id yang dikirim ke Midtrans saat membuat token
    const midtransOrderId = `INV-${invoice._id}-${midtransTs}`;

    const transactionStatusResponse = await snap.transaction.status(
      midtransOrderId
    );
    console.log(
      "Midtrans Transaction Status Response:",
      transactionStatusResponse
    );

    let newPaymentStatus = invoice.paymentStatus;
    let newOrderStatus = order.status;
    let specificPaymentMethod = invoice.specificPaymentMethod; // Ambil metode pembayaran yang ada

    if (
      transactionStatusResponse.transaction_status === "capture" ||
      transactionStatusResponse.transaction_status === "settlement"
    ) {
      newPaymentStatus = "Paid";
      newOrderStatus = "Pembayaran Dikonfirmasi";
      specificPaymentMethod = transactionStatusResponse.payment_type;
    } else if (transactionStatusResponse.transaction_status === "pending") {
      newPaymentStatus = "Pending";
      newOrderStatus = "Menunggu Pembayaran";
      specificPaymentMethod = transactionStatusResponse.payment_type; // Update juga metode pembayaran jika pending
    } else if (
      transactionStatusResponse.transaction_status === "deny" ||
      transactionStatusResponse.transaction_status === "cancel" ||
      transactionStatusResponse.transaction_status === "expire"
    ) {
      newPaymentStatus = "Failed";
      newOrderStatus = "Pembayaran Ditolak";
      specificPaymentMethod = transactionStatusResponse.payment_type;
    }

    // Perbarui Invoice jika ada perubahan status atau metode pembayaran
    if (
      invoice.paymentStatus !== newPaymentStatus ||
      invoice.specificPaymentMethod !== specificPaymentMethod
    ) {
      invoice.paymentStatus = newPaymentStatus;
      invoice.paymentDate = transactionStatusResponse.settlement_time
        ? new Date(transactionStatusResponse.settlement_time)
        : new Date();
      invoice.specificPaymentMethod = specificPaymentMethod;
      await invoice.save();
      console.log(
        `Invoice ${invoiceId} status updated to: ${newPaymentStatus}, method: ${specificPaymentMethod}`
      );
    }

    // Perbarui Order jika ada perubahan status atau payment
    if (
      order.status !== newOrderStatus ||
      order.payment !== (newPaymentStatus === "Paid")
    ) {
      order.status = newOrderStatus;
      order.payment = newPaymentStatus === "Paid";
      order.paidAt = newPaymentStatus === "Paid" ? new Date() : null;
      await order.save();
      console.log(
        `Order ${orderId} status updated to: ${newOrderStatus}, payment: ${order.payment}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui.",
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
    });
  } catch (error) {
      console.error("Error checking Midtrans transaction status:", error);
    
      // PERBAIKAN UTAMA DI SINI
      if (error.httpStatusCode === '404' && error.ApiResponse && error.ApiResponse.status_message) {
     // Menangani error 404 dari Midtrans secara spesifik
     return res.status(404).json({
    success: false,
    message: error.ApiResponse.status_message, // Ambil pesan dari status_message
    error: error.ApiResponse
     });
      }
      else if (error.ApiResponse && error.ApiResponse.error_messages && error.ApiResponse.error_messages.length > 0) {
        // Menangani error Midtrans lain yang mungkin memiliki error_messages
        return res.status(error.httpStatusCode || 500).json({
          success: false,
          message: error.ApiResponse.error_messages[0],
          error: error.ApiResponse,
        });
      }
      // Default fallback untuk error yang tidak terduga
      res.status(500).json({
       success: false,
    message: "Terjadi kesalahan server saat memeriksa status pembayaran.", // Pesan lebih umum
        error: error.message || error // Kirim error message asli jika ada
      });
    }
};

/**
 * @desc Get all invoices with related order and user details
 * @route GET /api/invoice/all
 * @access Private (Admin)
 */
const getAllInvoices = async (req, res) => {
  try {
      const invoices = await invoiceModel.find({}).sort({ createdAt: -1 });

      const formattedInvoices = await Promise.all(invoices.map(async (invoice) => {
          const orderDetail = await orderDetailModel.findById(invoice.orderDetailId)
              .populate({ path: 'items.productId', model: 'Product', select: 'name image price' });

          let order = null;
          let mainOrderId = null; // <-- This is what we need!

          if (orderDetail && orderDetail.orderId) {
              order = await orderModel.findById(orderDetail.orderId);
              if (order) {
                  mainOrderId = order._id; // Get the actual main order ID
              }
          }

          return {
              _id: invoice._id,
              orderDetailId: invoice.orderDetailId,
              mainOrderId: mainOrderId, 
              specificPaymentMethod: invoice.specificPaymentMethod,
              paymentStatus: invoice.paymentStatus,
              paymentDate: invoice.paymentDate,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
          };
      }));
      res.status(200).json({ success: true, invoices: formattedInvoices });
  } catch (error) { /* ... */ }
};


/**
* @desc Get total and monthly revenue report
* @route GET /api/invoice/revenue-report
* @access Private (Admin)
*/
const getRevenueReport = async (req, res) => {
  try {
      // Find all invoices that have "Paid" status
      const paidInvoices = await invoiceModel.find({ paymentStatus: "Paid" });

      let totalRevenue = 0;
      const monthlyRevenue = {}; // { 'YYYY-MM': amount }

      // Fetch corresponding orders for paid invoices to get totalAmount
      const revenuePromises = paidInvoices.map(async (invoice) => {
          const orderDetail = await orderDetailModel.findById(invoice.orderDetailId);
          if (orderDetail) {
              const order = await orderModel.findById(orderDetail.orderId);
              if (order && order.totalAmount) {
                  totalRevenue += order.totalAmount;

                  // Calculate monthly revenue
                  const paymentDate = invoice.paymentDate || order.paidAt; // Use invoice.paymentDate if available, else order.paidAt
                  if (paymentDate) {
                      const date = new Date(paymentDate);
                      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                      monthlyRevenue[yearMonth] = (monthlyRevenue[yearMonth] || 0) + order.totalAmount;
                  }
              }
          }
      });

      await Promise.all(revenuePromises);

      // Convert monthlyRevenue object to an array for easier frontend consumption
      const monthlyRevenueArray = Object.keys(monthlyRevenue).map(key => ({
          month: key,
          revenue: monthlyRevenue[key]
      })).sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically

      res.status(200).json({
          success: true,
          totalRevenue: totalRevenue,
          monthlyRevenue: monthlyRevenueArray,
      });

  } catch (error) {
      console.error("Error fetching revenue report:", error);
      res.status(500).json({ success: false, message: error.message || "Gagal mengambil laporan pendapatan." });
  }
};


export {
  getMidtransToken,
  handleMidtransNotification, // Biarkan ini ada tapi tidak melakukan update DB
  sendInvoiceEmail,
  getInvoiceById,
  getInvoiceByOrderDetailId,
  checkMidtransTransactionStatus,
  getRevenueReport,
  getAllInvoices
};

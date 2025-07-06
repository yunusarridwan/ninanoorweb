import orderModel from "../models/orderModel.js";
import orderDetailModel from "../models/orderDetailModel.js";
import userModel from "../models/userModel.js";
import invoiceModel from "../models/invoiceModel.js"; // Tetap impor untuk membuat invoice
import mongoose from "mongoose";

const placeOrder = async (req, res) => {
    let createdOrder = null;
    let createdOrderDetail = null;
    let createdInvoice = null; // Deklarasikan di sini agar bisa diakses di blok catch

    console.time('Order Placement Process'); // Start timer for process

    try {
        // Asumsi req.user.id sudah disuntikkan oleh middleware autentikasi
        const userId = req.user.id; 
        const {
            items,
            amount, // subtotal items
            address,
            receivedName,
            deliveryDate, // Akan divalidasi formatnya
            totalWeight,
            shippingCost,
            totalAmount, // subtotal items + shippingCost
            paymentMethod, // Metode pembayaran awal (misal: "Midtrans Snap")
            messageOrder,
            recipientPhone // Akan divalidasi formatnya
        } = req.body;

        console.log("BACKEND: Data order diterima. userId:", userId);
        // console.log("BACKEND: Request Body:", JSON.stringify(req.body, null, 2)); // Uncomment for detailed debugging if needed

        // --- START: VALIDASI INPUT (Semua Bagian yang Perlu Divalidasi) ---

        // 1. Validasi Keberadaan Field Utama
        const missingFields = [];
        if (!items || items.length === 0) missingFields.push('items');
        if (totalAmount === undefined || totalAmount === null) missingFields.push('totalAmount');
        if (totalWeight === undefined || totalWeight === null) missingFields.push('totalWeight');
        if (!deliveryDate) missingFields.push('deliveryDate');
        if (!address) missingFields.push('address');
        if (!receivedName) missingFields.push('receivedName');
        if (!recipientPhone) missingFields.push('recipientPhone');
        if (shippingCost === undefined || shippingCost === null) missingFields.push('shippingCost');
        if (amount === undefined || amount === null) missingFields.push('amount');

        if (missingFields.length > 0) {
            console.error(`BACKEND: Validasi field utama gagal. Field kosong: ${missingFields.join(', ')}`);
            console.timeEnd('Order Placement Process');
            return res.status(400).json({ success: false, message: `Semua field utama wajib diisi! Missing: ${missingFields.join(', ')}` });
        }
        console.log("BACKEND: Validasi keberadaan field utama berhasil.");

        // 2. Validasi Sub-Field Alamat
        const missingAddressFields = [];
        if (!address.street) missingAddressFields.push('street');
        if (!address.province) missingAddressFields.push('province');
        if (!address.regency) missingAddressFields.push('regency');
        if (!address.district) missingAddressFields.push('district');
        if (!address.zipcode) missingAddressFields.push('zipcode');

        if (missingAddressFields.length > 0) {
            console.error(`BACKEND: Validasi detail alamat gagal. Field alamat kosong: ${missingAddressFields.join(', ')}`);
            console.timeEnd('Order Placement Process');
            return res.status(400).json({ success: false, message: `Detail alamat (${missingAddressFields.join(', ')}) wajib diisi!` });
        }
        console.log("BACKEND: Validasi detail alamat berhasil.");

        // 3. Validasi Format Nomor Telepon Penerima
        const phoneRegex = /^[0-9]{10,15}$/; // Regex: 10 hingga 15 digit angka
        if (!phoneRegex.test(recipientPhone)) {
            console.error(`BACKEND: Validasi nomor telepon gagal. Format tidak valid: ${recipientPhone}`);
            console.timeEnd('Order Placement Process');
            return res.status(400).json({ success: false, message: "Nomor telepon penerima tidak valid. Masukkan 10-15 digit angka." });
        }
        console.log("BACKEND: Validasi nomor telepon berhasil.");

        // 4. Validasi Tanggal Pengiriman
        const minDeliveryDate = new Date();
        minDeliveryDate.setDate(minDeliveryDate.getDate() + 2); // Minimum H+2 (hari ini + 2 hari)
        minDeliveryDate.setHours(0, 0, 0, 0); // Set ke awal hari untuk perbandingan

        const parsedDeliveryDate = new Date(deliveryDate); // Konversi string tanggal dari frontend ke Date object
        parsedDeliveryDate.setHours(0, 0, 0, 0); // Set ke awal hari untuk perbandingan

        if (isNaN(parsedDeliveryDate.getTime())) { // Cek apakah tanggal valid
            console.error(`BACKEND: Validasi tanggal pengiriman gagal. Format tanggal tidak valid: ${deliveryDate}`);
            console.timeEnd('Order Placement Process');
            return res.status(400).json({ success: false, message: "Format tanggal pengiriman tidak valid." });
        }
        
        if (parsedDeliveryDate < minDeliveryDate) {
            console.error(`BACKEND: Validasi tanggal pengiriman gagal. Tanggal terlalu dekat: ${deliveryDate}`);
            console.timeEnd('Order Placement Process');
            return res.status(400).json({ success: false, message: `Tanggal pengiriman harus minimal H+2 dari hari ini.` });
        }
        console.log("BACKEND: Validasi tanggal pengiriman berhasil.");

        // 5. Validasi Item Produk dalam Keranjang
        for (const item of items) {
            if (!item._id || !item.name || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0 || !item.totalPrice || item.totalPrice <= 0) {
                console.error("BACKEND: Validasi item keranjang gagal. Beberapa detail item tidak valid:", item);
                console.timeEnd('Order Placement Process');
                return res.status(400).json({ success: false, message: "Detail produk dalam keranjang tidak valid atau kosong." });
            }
        }
        console.log("BACKEND: Validasi detail item keranjang berhasil.");

        // --- END: VALIDASI INPUT ---

        // 1. Create Order (main order)
        const orderData = new orderModel({
            userId,
            totalAmount,
            totalWeight,
            paymentMethod: paymentMethod || "Midtrans Snap",
            status: "Menunggu Pembayaran",
            orderDate: new Date(),
            deliveryDate: parsedDeliveryDate, // Gunakan Date object yang sudah divalidasi
            payment: false,
            paidAt: null,
        });

        createdOrder = await orderData.save();
        console.log("BACKEND: Order utama disimpan. Order ID:", createdOrder._id);

        // 2. Create Order Detail
        const orderDetailData = new orderDetailModel({
            orderId: createdOrder._id,
            address: address,
            recipientName: receivedName,
            recipientPhone: recipientPhone,
            shippingCost: shippingCost,
            amount: amount,
            messageOrder: messageOrder || 'tidak ada',
            items: items.map(item => ({
                productId: item._id, 
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                size: item.size,
                totalPrice: item.totalPrice
            }))
        });

        createdOrderDetail = await orderDetailData.save();
        console.log("BACKEND: Detail Order disimpan. Order Detail ID:", createdOrderDetail._id);

        // 3. Create Invoice
        const newInvoice = new invoiceModel({
            orderDetailId: createdOrderDetail._id,
            paymentMethod: paymentMethod || "Midtrans Snap",
            paymentStatus: "Pending",
            paymentDate: null,
            specificPaymentMethod: null,
        });

        createdInvoice = await newInvoice.save();
        console.log("BACKEND: Invoice baru berhasil dibuat:", createdInvoice._id);

        // 4. Clear user's cart
        await userModel.findByIdAndUpdate(userId, { items: {} });
        console.log("BACKEND: Keranjang user dikosongkan.");

        console.log("BACKEND: Semua dokumen berhasil disimpan.");
        console.timeEnd('Order Placement Process');

        res.json({
            success: true,
            message: "Order berhasil dibuat!",
            orderId: createdOrder._id,
            orderDetailId: createdOrderDetail._id,
            invoiceId: createdInvoice._id,
        });

    } catch (error) {
        console.error("BACKEND: Error saat placeOrder:", error);

        // --- Manual Cleanup Logic ---
        console.log("BACKEND: Melakukan cleanup karena terjadi error...");
        if (createdInvoice) {
            try {
                await invoiceModel.findByIdAndDelete(createdInvoice._id);
                console.log(`BACKEND: Berhasil menghapus Invoice ID: ${createdInvoice._id}`);
            } catch (cleanErr) {
                console.error(`BACKEND: Gagal menghapus Invoice ID: ${createdInvoice._id}`, cleanErr);
            }
        }
        if (createdOrderDetail) {
            try {
                await orderDetailModel.findByIdAndDelete(createdOrderDetail._id);
                console.log(`BACKEND: Berhasil menghapus OrderDetail ID: ${createdOrderDetail._id}`);
            } catch (cleanErr) {
                console.error(`BACKEND: Gagal menghapus OrderDetail ID: ${createdOrderDetail._id}`, cleanErr);
            }
        }
        if (createdOrder) {
            try {
                await orderModel.findByIdAndDelete(createdOrder._id);
                console.log(`BACKEND: Berhasil menghapus Order ID: ${createdOrder._id}`);
            } catch (cleanErr) {
                console.error(`BACKEND: Gagal menghapus Order ID: ${createdOrder._id}`, cleanErr);
            }
        }
        console.timeEnd('Order Placement Process');

        // Penanganan error yang lebih spesifik berdasarkan jenis error
        if (error.name === 'ValidationError') {
            // Error validasi dari Mongoose (jika ada skema yang tidak cocok)
            return res.status(400).json({ success: false, message: error.message, errors: error.errors });
        } else if (error.code === 11000) {
            // MongoDB duplicate key error
            return res.status(409).json({ success: false, message: "Data duplikat terdeteksi." });
        } else if (error.kind === 'ObjectId') {
            // Error jika ObjectId tidak valid (misal userId atau productId)
            return res.status(400).json({ success: false, message: "ID pengguna atau produk tidak valid." });
        } else if (error.response) {
            // Error dari API eksternal (misal Midtrans jika ada di sini dan dilemparkan kembali)
            const { status, data } = error.response;
            console.error(`BACKEND: Error dari respons eksternal - Status: ${status}, Data:`, data);
            if (status === 400)
                return res.status(400).json({ success: false, message: data.message || "Permintaan ke layanan eksternal tidak valid!" });
            else if (status === 500)
                return res.status(500).json({ success: false, message: "Kesalahan server eksternal, coba lagi nanti." });
        }
        // General server error
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat membuat pesanan." });
    }
};

const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate('userId', 'username email')
            .sort({ orderDate: -1 });

        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const orderDetail = await orderDetailModel.findOne({ orderId: order._id })
                .populate('items.productId', 'name image price');
            
            const invoice = await invoiceModel.findOne({ orderDetailId: orderDetail?._id });

            // Ambil objek dasar dari order utama
            const orderObject = order.toObject();

            // Jika orderDetail ditemukan, tambahkan properti yang relevan dari orderDetail
            // TETAPI pastikan TIDAK menimpa orderObject._id
            if (orderDetail) {
                const orderDetailObject = orderDetail.toObject();
                // Contoh: Anda mungkin ingin menggabungkan items dari orderDetail
                // atau properti lain seperti receivedName, deliveryAddress, dll.
                // Jika orderDetail punya field yang sama dengan order utama,
                // Anda harus memilih mana yang ingin Anda gunakan.
                
                // Jika Anda ingin items dari orderDetail:
                orderObject.items = orderDetailObject.items;

                // Jika ada properti lain dari orderDetail yang Anda inginkan (selain _id-nya):
                // orderObject.receivedName = orderDetailObject.receivedName;
                // orderObject.deliveryAddress = orderDetailObject.deliveryAddress;
                // orderObject.paymentMethod = orderDetailObject.paymentMethod; // Jika ada di orderDetail
            }

            // Tambahkan properti dari invoice
            orderObject.invoiceId = invoice?._id;
            orderObject.paymentStatus = invoice?.paymentStatus;
            orderObject.specificPaymentMethod = invoice?.specificPaymentMethod;
            
            // Mengembalikan orderObject yang sudah dimodifikasi
            return orderObject;
        }));

        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error("Error fetching all orders:", error.message);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar pesanan." });
    }
};

const userOrders = async (req, res) => {
    try {
        const userId = req.user.id; // AMBIL userId DARI TOKEN JWT UNTUK KEAMANAN

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "User ID tidak valid atau tidak tersedia!" });
        }

        const orders = await orderModel.find({ userId })
            .sort({ orderDate: -1 });

        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const orderDetail = await orderDetailModel.findOne({ orderId: order._id })
                .populate('items.productId', 'name image price');
            
            // Ambil invoice yang terkait
            const invoice = await invoiceModel.findOne({ orderDetailId: orderDetail?._id });

            if (!orderDetail) {
                console.warn(`Order Detail not found for Order ID: ${order._id}`);
                return order.toObject();
            }

            return {
                ...order.toObject(),
                // Data dari OrderDetail
                address: orderDetail.address,
                recipientName: orderDetail.recipientName,
                recipientPhone: orderDetail.recipientPhone,
                shippingCost: orderDetail.shippingCost,
                amount: orderDetail.amount,
                messageOrder: orderDetail.messageOrder,
                items: orderDetail.items.map(item => ({
                    _id: item.productId ? item.productId._id : null,
                    name: item.name,
                    size: item.size,
                    weight: item.weight,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    image: item.image || (item.productId && item.productId.image),
                })),
                // Data dari Invoice
                invoiceId: invoice?._id, // <-- PENTING: Sertakan invoiceId di sini
                paymentMethod: invoice?.paymentMethod, // Metode pembayaran awal
                specificPaymentMethod: invoice?.specificPaymentMethod, // Metode pembayaran spesifik dari Midtrans
                paymentStatus: invoice?.paymentStatus, // Status pembayaran dari invoice
                paymentDate: invoice?.paymentDate, // Tanggal pembayaran dari invoice
            };
        }));

        res.json({ success: true, orders: ordersWithDetails });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fungsi updateStatus ini bisa digunakan untuk pembaruan status umum oleh admin,
// tapi tidak akan digunakan oleh frontend untuk update status pembayaran Midtrans.
const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // --- DEBUGGING STEP 1: LOG INPUTS ---
        console.log(`[DEBUG - updateStatus] Received request for Order ID: ${orderId}, New Status: ${status}`);
        console.log(`[DEBUG - updateStatus] Request Body: ${JSON.stringify(req.body)}`);
        console.log(`[DEBUG - updateStatus] Request Params: ${JSON.stringify(req.params)}`);

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            // --- DEBUGGING STEP 2: LOG INVALID ID ---
            console.error(`[DEBUG - updateStatus] ERROR: Invalid Order ID format detected: ${orderId}`);
            return res.status(400).json({ success: false, message: "ID pesanan tidak valid!" });
        }

        const validStatuses = [
            'Menunggu Pembayaran',
            'Pembayaran Dikonfirmasi',
            'Diproses',
            'Dikirim',
            'Selesai',
            'Dibatalkan'
        ];

        if (!validStatuses.includes(status)) {
            // --- DEBUGGING STEP 3: LOG INVALID STATUS ---
            console.error(`[DEBUG - updateStatus] ERROR: Invalid status value provided: ${status}. Allowed statuses: ${validStatuses.join(', ')}`);
            return res.status(400).json({ success: false, message: "Status tidak valid!" });
        }

        // --- DEBUGGING STEP 4: Cek keberadaan Order sebelum update (Opsional tapi direkomendasikan) ---
        // Dengan findByIdAndUpdate, jika orderId tidak ditemukan, operasi akan berhasil tapi tidak ada yang diupdate.
        // Untuk memastikan ordernya ada dan memberikan pesan yang lebih baik jika tidak, bisa tambahkan ini:
        const existingOrder = await orderModel.findById(orderId);
        if (!existingOrder) {
            console.warn(`[DEBUG - updateStatus] WARNING: Order with ID ${orderId} not found. No update performed.`);
            return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan!" });
        }
        console.log(`[DEBUG - updateStatus] Found existing order. Current status: ${existingOrder.status}`);


        // --- DEBUGGING STEP 5: MELAKUKAN UPDATE DAN LOG HASILNYA ---
        // Menggunakan findByIdAndUpdate dengan { new: true } untuk mendapatkan dokumen yang sudah diupdate
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true } // 'new: true' mengembalikan dokumen setelah update, 'runValidators: true' menjalankan validasi skema
        );

        if (!updatedOrder) {
            // Ini bisa terjadi jika orderId valid tapi tidak ada dokumen yang cocok
            console.error(`[DEBUG - updateStatus] ERROR: Update operation returned null for Order ID: ${orderId}. Possible: ID valid but not found.`);
            return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan setelah mencoba update." });
        }

        console.log(`[DEBUG - updateStatus] Successfully updated Order ID: ${orderId}. New status: ${updatedOrder.status}`);
        res.json({ success: true, message: "Status Updated", updatedOrder }); // Sertakan updatedOrder untuk debugging frontend
    } catch (error) {
        // --- DEBUGGING STEP 6: LOG KESALAHAN UMUM ---
        console.error(`[DEBUG - updateStatus] Caught an error during update: ${error.message}`);
        console.error(`[DEBUG - updateStatus] Error Details: `, error);

        // Memberikan pesan error yang lebih spesifik jika ini adalah error Mongoose ValidationError
        if (error.name === 'ValidationError') {
            console.error(`[DEBUG - updateStatus] Mongoose Validation Error: ${error.message}`);
            // Anda bisa mengiterasi error.errors untuk detail lebih lanjut jika ada banyak field
            for (let field in error.errors) {
                console.error(`  - Field: ${field}, Message: ${error.errors[field].message}`);
            }
            return res.status(400).json({ success: false, message: `Data tidak valid: ${error.message}` });
        }
        res.status(500).json({ success: false, message: "Gagal memperbarui status pesanan." });
    }
};

// Fungsi `updateOrderStatus` ini SEHARUSNYA TIDAK DIGUNAKAN LAGI oleh frontend
// setelah Anda mengimplementasikan `checkMidtransTransactionStatus` di `invoiceController`.
// Logika update status pembayaran Midtrans sudah di `invoiceController`.
// Jika Anda ingin mempertahankan ini untuk alasan lain (misal, update manual),
// maka pastikan tidak bentrok dengan logika invoiceController.
// Saya akan biarkan dengan sedikit komentar tambahan.
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        console.log(`[Backend] Menerima permintaan update status untuk Order ID: ${orderId}, Status Baru: ${status}`);

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            console.log(`[Backend] Error: ID pesanan tidak valid: ${orderId}`);
            return res.status(400).json({ success: false, message: "ID pesanan tidak valid!" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            console.log(`[Backend] Error: Pesanan tidak ditemukan untuk ID: ${orderId}`);
            return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan!" });
        }

        console.log(`[Backend] Status pesanan saat ini (sebelum update): ${order.status}`);

        const validStatuses = [
            'Menunggu Pembayaran',
            'Pembayaran Dikonfirmasi',
            'Diproses',
            'Dikirim',
            'Selesai',
            'Dibatalkan'
        ];
        if (!validStatuses.includes(status)) {
            console.log(`[Backend] Error: Status tidak valid: ${status}`);
            return res.status(400).json({ success: false, message: "Status tidak valid!" });
        }

        order.status = status;
        // Jika Anda punya logika lain yang mungkin mengganggu, coba komen dulu sementara
        // order.paymentMethod = paymentMethod;
        // order.payment = (status === 'Pembayaran Dikonfirmasi');
        // order.paidAt = new Date();

        await order.save(); // Ini adalah titik krusial

        console.log(`[Backend] Status pesanan berhasil diperbarui menjadi: ${order.status}`);
        res.json({ success: true, message: "Status pesanan diperbarui!" });
    } catch (error) {
        console.error("[Backend] GAGAL memperbarui status pesanan:", error);
        // Log detail error Mongoose jika ada
        if (error.name === 'ValidationError') {
            console.error("[Backend] Mongoose Validation Error:", error.message);
            for (let field in error.errors) {
                console.error(`  - Field: ${field}, Message: ${error.errors[field].message}`);
            }
        }
        res.status(500).json({ success: false, message: "Gagal memperbarui status pesanan." });
    }
};

const getOrderStatusCountByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "ID Pengguna tidak valid." });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId); // Define userObjectId

        // Inisialisasi hitungan untuk semua status yang Anda harapkan di frontend
        const counts = {
            "Menunggu Pembayaran": 0,
            "Paid": 0,
            "Proses": 0, // Mapping dari "Diproses"
            "Pengiriman": 0, // Mapping dari "Dikirim"
            "Selesai": 0,
            "Dibatalkan": 0,
            "Gagal": 0
        };

        const result = await orderModel.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                // Case 1: Payment Confirmed -> Paid
                                { case: { $eq: ["$status", "Pembayaran Dikonfirmasi"] }, then: "Paid" },
                                // Case 2: Proses -> Proses (nama key di frontend)
                                { case: { $eq: ["$status", "Diproses"] }, then: "Proses" },
                                // Case 3: Dikirim -> Pengiriman (nama key di frontend)
                                { case: { $eq: ["$status", "Dikirim"] }, then: "Pengiriman" },
                                // Case 4: Gagal -> Gagal
                                { case: { $eq: ["$status", "Gagal"] }, then: "Gagal" }
                                // Default case for other statuses (Menunggu Pembayaran, Selesai, Dibatalkan)
                                // whose names are consistent between DB and frontend
                            ],
                            default: "$status"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Menggabungkan hasil aggregation ke objek counts
        result.forEach(item => {
            if (counts.hasOwnProperty(item._id)) { // Pastikan key ada di inisialisasi counts
                counts[item._id] = item.count;
            }
        });

        res.status(200).json({ success: true, data: counts });

    } catch (error) {
        console.error("Error fetching order status counts:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil jumlah status pesanan." });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "ID Pesanan tidak valid!" });
        }

        // 1. Ambil Order berdasarkan orderId
        const order = await orderModel.findById(orderId).lean();

        if (!order) {
            return res.status(404).json({ success: false, message: "Order tidak ditemukan!" });
        }

        // 2. Ambil OrderDetail yang terkait dengan Order ini
        const orderDetail = await orderDetailModel.findOne({ orderId: order._id })
            .populate({
                path: 'items.productId',
                model: 'Product', // Pastikan nama model Product benar
                select: 'name image'
            })
            .lean();

        if (!orderDetail) {
            return res.status(404).json({ success: false, message: "Detail pesanan tidak ditemukan untuk ID Order ini." });
        }

        // 3. Ambil Invoice yang terkait dengan OrderDetail ini
        // Menggunakan orderDetail?._id untuk memastikan tidak error jika orderDetail null
        const invoice = await invoiceModel.findOne({ orderDetailId: orderDetail?._id }).lean();

        // 4. Ambil User (pemesan) untuk detail pemesan
        const user = await userModel.findById(order.userId).lean();

        // --- Pembentukan Alamat Lengkap ---
        const rawAddress = orderDetail?.address;
        let formattedAddress = 'Alamat tidak tersedia';

        if (rawAddress) {
            const street = rawAddress.street || 'N/A';
            const village = rawAddress.village || 'N/A';
            const district = rawAddress.district || 'N/A';
            const regency = rawAddress.regency || 'N/A';
            const province = rawAddress.province || 'N/A';
            const zipcode = rawAddress.zipcode || 'N/A';

            formattedAddress = `${street}, Kel. ${village}, Kec. ${district}, ${regency}, Prov. ${province}, Kode Pos ${zipcode}`;
        }
        // --- Akhir Pembentukan Alamat Lengkap ---

        // Gabungkan data yang dibutuhkan ke dalam satu objek respons
        const combinedOrderData = {
            ...order, // Semua data dari order utama
            userName: user?.name,
            userEmail: user?.email,
            
            // Properti dari orderDetail
            recipientName: orderDetail?.recipientName,
            recipientPhone: orderDetail?.recipientPhone,
            
            // --- BAGIAN ADDRESS YANG DISESUAIKAN ---
            address: rawAddress, // Kirim objek address mentah secara keseluruhan
            formattedAddress: formattedAddress, // Kirim juga alamat yang sudah diformat (opsional)
            // --- AKHIR BAGIAN ADDRESS ---

            items: orderDetail?.items,
            amount: orderDetail?.amount, // Subtotal item
            shippingCost: orderDetail?.shippingCost,
            messageOrder: orderDetail?.messageOrder,
            orderDetailId: orderDetail?._id, // ID OrderDetail

            // Data dari Invoice
            invoiceId: invoice?._id, // <-- PENTING: Sertakan invoiceId di sini
            paymentMethod: invoice?.paymentMethod, // Metode pembayaran awal dari invoice
            specificPaymentMethod: invoice?.specificPaymentMethod, // Metode pembayaran spesifik dari invoice
            paymentStatus: invoice?.paymentStatus, // Status pembayaran dari invoice
            paymentDate: invoice?.paymentDate, // Tanggal pembayaran dari invoice
        };

        res.status(200).json({ success: true, order: combinedOrderData });

    } catch (error) {
        console.error("Error fetching order detail:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOrderDetailSimple = async (req, res) => {
    try {
        // Ambil orderId dari parameter URL.
        // Berdasarkan frontend, ini adalah ID pesanan UTAMA (order._id)
        const orderIdFromUrl = req.params.orderId;

        console.log(`[Backend DEBUG - getOrderDetailSimple] Menerima request untuk Order ID UTAMA: ${orderIdFromUrl}`);

        if (!mongoose.Types.ObjectId.isValid(orderIdFromUrl)) {
            console.log(`[Backend DEBUG - getOrderDetailSimple] Format Order ID UTAMA TIDAK VALID: ${orderIdFromUrl}`);
            return res.status(400).json({ success: false, message: "ID Pesanan tidak valid!" });
        }

        // 1. Ambil Order utama berdasarkan orderId dari URL
        const order = await orderModel.findById(orderIdFromUrl).lean();
        console.log(`[Backend DEBUG - getOrderDetailSimple] Hasil query orderModel.findById(${orderIdFromUrl}): ${order ? 'DITEMUKAN' : 'TIDAK DITEMUKAN'}`);

        if (!order) {
            // Jika order utama tidak ditemukan, kembalikan 404
            return res.status(404).json({ success: false, message: "Pesanan utama tidak ditemukan!" });
        }

        // 2. Ambil OrderDetail yang terkait dengan Order utama ini
        // Kita gunakan order._id karena itu adalah ID pesanan utama yang benar
        const orderDetail = await orderDetailModel.findOne({ orderId: order._id })
            .populate({
                path: 'items.productId',
                model: 'Product',
                select: 'name image' // Hanya ambil nama dan gambar produk
            })
            .lean();

        console.log(`[Backend DEBUG - getOrderDetailSimple] Hasil query orderDetailModel.findOne({ orderId: ${order._id} }): ${orderDetail ? 'DITEMUKAN' : 'TIDAK DITEMUKAN'}`);

        if (!orderDetail) {
            // Ini bisa terjadi jika ada order tetapi tidak ada detailnya
            console.warn(`[Backend DEBUG - getOrderDetailSimple] Detail pesanan tidak ditemukan untuk Order ID: ${order._id}`);
            // Anda bisa memilih untuk tetap mengembalikan order utama saja atau 404
            return res.status(404).json({ success: false, message: "Detail pesanan tidak ditemukan untuk pesanan ini." });
        }

        // 3. Ambil Invoice yang terkait dengan OrderDetail ini
        const invoice = await invoiceModel.findOne({ orderDetailId: orderDetail._id }).lean();
        console.log(`[Backend DEBUG - getOrderDetailSimple] Hasil query invoiceModel.findOne({ orderDetailId: ${orderDetail._id} }): ${invoice ? 'DITEMUKAN' : 'TIDAK DITEMUKAN'}`);

        // 4. Ambil User (pemesan) untuk detail pemesan
        const user = await userModel.findById(order.userId).lean();
        console.log(`[Backend DEBUG - getOrderDetailSimple] Hasil query userModel.findById(${order.userId}): ${user ? 'DITEMUKAN' : 'TIDAK DITEMUKAN'}`);

        // --- Pembentukan Alamat Lengkap ---
        const rawAddress = orderDetail.address; // Menggunakan orderDetail.address
        let formattedAddress = 'Alamat tidak tersedia';

        if (rawAddress) {
            const street = rawAddress.street || 'N/A';
            const village = rawAddress.village || 'N/A';
            const district = rawAddress.district || 'N/A';
            const regency = rawAddress.regency || 'N/A';
            const province = rawAddress.province || 'N/A';
            const zipcode = rawAddress.zipcode || 'N/A';

            formattedAddress = `${street}, Kel. ${village}, Kec. ${district}, ${regency}, Prov. ${province}, Kode Pos ${zipcode}`;
        }
        // --- Akhir Pembentukan Alamat Lengkap ---

        // Gabungkan data yang dibutuhkan ke dalam satu objek respons
        const combinedOrderData = {
            ...order, // Semua data dari order utama (termasuk _id yang benar)
            userName: user?.username || user?.name || 'N/A', // Prioritaskan username jika ada
            userEmail: user?.email || 'N/A',
            
            // Properti dari orderDetail
            recipientName: orderDetail.recipientName,
            recipientPhone: orderDetail.recipientPhone,
            address: rawAddress, // Kirim objek address mentah secara keseluruhan
            formattedAddress: formattedAddress, // Kirim juga alamat yang sudah diformat (opsional)
            items: orderDetail.items.map(item => ({
                _id: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                size: item.size,
                weight: item.weight,
                // Pastikan image diambil dengan benar, dari populated product atau fallback
                image: item.productId?.image || item.image || 'https://via.placeholder.com/80' 
            })),
            amount: orderDetail.amount, // Subtotal item
            shippingCost: orderDetail.shippingCost,
            messageOrder: orderDetail.messageOrder,
            // Perhatikan: totalWeight ada di order utama DAN orderDetail. Pilih yang sesuai.
            // Jika totalWeight di orderDetail lebih akurat untuk detail, gunakan itu:
            totalWeight: orderDetail.totalWeight, 
            orderDetailId: orderDetail._id, // ID OrderDetail

            // Data dari Invoice
            invoiceId: invoice?._id,
            paymentMethod: invoice?.paymentMethod,
            specificPaymentMethod: invoice?.specificPaymentMethod,
            paymentStatus: invoice?.paymentStatus,
            paymentDate: invoice?.paymentDate,
        };

        res.status(200).json({ success: true, order: combinedOrderData });

    } catch (error) {
        console.error("[Backend DEBUG - getOrderDetailSimple] Terjadi Error:", error);
        res.status(500).json({ success: false, message: error.message || "Kesalahan server internal." });
    }
};

export { 
    placeOrder, 
    allOrders, 
    userOrders, 
    updateStatus, // Untuk update status umum
    updateOrderStatus, // Perlu diperhatikan penggunaannya sekarang
    getOrderStatusCountByUser, 
    getOrderDetail,
    getOrderDetailSimple
};
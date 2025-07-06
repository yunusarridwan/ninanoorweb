import PropTypes from 'prop-types'; // Import PropTypes

// Fungsi helper untuk format Rupiah
const formatRupiah = (angka) => `Rp ${angka.toLocaleString("id-ID")},00`;

const Invoice = ({ invoiceData }) => {
  // Pastikan invoiceData ada sebelum mencoba merender
  if (!invoiceData) {
    return <div className="p-4 text-center text-red-500">Data invoice tidak ditemukan.</div>;
  }

  const {
    kodeInvoice,
    pemesan,
    tglPemesanan,
    tglPengiriman,
    penerima,
    telpPenerima,
    alamatPengiriman,
    items,
    subTotal,
    ongkosKirim,
    totalBelanja,
    metodePembayaran,
    messageOrder,
    paymentStatus,
  } = invoiceData;

  return (
    <div className="invoice-container p-6 bg-white shadow-lg rounded-md border text-sm max-w-2xl mx-auto print:shadow-none print:border-none">

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ninanoor Bakeshop</h1>
        <p className="text-lg text-gray-600">Invoice Pembelian</p>
      </div>

      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-700">Invoice #{kodeInvoice}</h2>
          <p className="text-gray-600">Tanggal Pesanan: {tglPemesanan}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-700">Status Pembayaran:</p>
          <p className={`font-bold ${paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{paymentStatus}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Informasi Pemesan:</h3>
          <p><strong>Nama:</strong> {pemesan}</p>
          <p><strong>Tanggal Pengiriman:</strong> {tglPengiriman}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Informasi Penerima:</h3>
          <p><strong>Nama:</strong> {penerima}</p>
          <p><strong>Telp:</strong> {telpPenerima}</p>
          <p><strong>Alamat:</strong> {alamatPengiriman}</p>
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Detail Pesanan:</h3>
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 border border-gray-300">Produk</th>
            <th className="py-2 px-3 border border-gray-300 text-center">Qty</th>
            <th className="py-2 px-3 border border-gray-300 text-right">Harga Satuan</th>
            <th className="py-2 px-3 border border-gray-300 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-3 border border-gray-300">
                {item.name} {item.size && `(${item.size})`}
              </td>
              <td className="py-2 px-3 border border-gray-300 text-center">{item.quantity}</td>
              <td className="py-2 px-3 border border-gray-300 text-right">{formatRupiah(item.price)}</td>
              <td className="py-2 px-3 border border-gray-300 text-right">{formatRupiah(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mb-6">
        <p className="mb-1">Sub Total Barang: <span className="font-semibold">{formatRupiah(subTotal)}</span></p>
        <p className="mb-1">Total Ongkos Kirim: <span className="font-semibold">{formatRupiah(ongkosKirim)}</span></p>
        <h4 className="text-xl font-bold text-gray-800 mt-2">Total Belanja: {formatRupiah(totalBelanja)}</h4>
      </div>

      <div className="mb-6">
        <p className="mb-1"><strong>Metode Pembayaran:</strong> {metodePembayaran}</p>
        {messageOrder && <p className="mb-1"><strong>Catatan Order:</strong> {messageOrder}</p>}
      </div>

      <div className="text-center text-gray-500 text-xs border-t pt-4">
        <p>Invoice ini sah dan diproses oleh komputer.</p>
        <p>Silakan hubungi Ninanoor Bakeshop apabila kamu membutuhkan bantuan.</p>
      </div>
    </div>
  );
};

// --- Tambahkan Prop Types di sini ---
Invoice.propTypes = {
  invoiceData: PropTypes.shape({
    kodeInvoice: PropTypes.string.isRequired,
    pemesan: PropTypes.string.isRequired,
    tglPemesanan: PropTypes.string.isRequired, // Diasumsikan string karena sudah diformat di OrderDetail
    tglPengiriman: PropTypes.string.isRequired, // Diasumsikan string
    penerima: PropTypes.string.isRequired,
    telpPenerima: PropTypes.string.isRequired,
    alamatPengiriman: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        size: PropTypes.string, // Size bisa opsional
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
        totalPrice: PropTypes.number.isRequired,
      })
    ).isRequired,
    subTotal: PropTypes.number.isRequired,
    ongkosKirim: PropTypes.number.isRequired,
    totalBelanja: PropTypes.number.isRequired,
    metodePembayaran: PropTypes.string.isRequired,
    messageOrder: PropTypes.string, // messageOrder bisa opsional (tidak selalu ada)
    paymentStatus: PropTypes.string.isRequired,
  }).isRequired,
};

export default Invoice;
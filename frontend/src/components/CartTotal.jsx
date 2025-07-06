import { useContext } from "react";
import Title from "./Title";
import { ShopContext } from "../context/ShopContextDef";
import PropTypes from "prop-types";

const CartTotal = ({ shippingCost = 0}) => {
  const { getCartAmount, getWeightAmount, items, foods } =
    useContext(ShopContext);

  // Fungsi untuk format ke IDR
  const formatToIDR = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Hitung total secara aman
  const subtotal = getCartAmount();
  const total = isNaN(subtotal + shippingCost) ? 0 : subtotal + shippingCost;

  return (
    <div className="w-full">
      {/* title */}
      <Title title1={"Jumlah"} title2={"Keranjang"} title1Styles={"h3"} />

      {/* Subtotal */}
      <div className="flexBetween pt-3">
        <h5 className="h5">SubTotal: </h5>
        <p className="h5">{formatToIDR(subtotal)}</p>
      </div>

      {/* Daftar Belanjaan dengan Total Harga per Item */}
      <div className="mt-2 text-xs text-gray-500">
        {Object.keys(items).length === 0 ? (
          <p className="text-center text-gray-400">Cart Kosong</p>
        ) : (
          Object.entries(items).map(([itemId, sizes]) =>
            Object.entries(sizes).map(([size, quantity]) => {
              const productData = foods.find(
                (product) => product._id === itemId
              );

              // --- PERBAIKAN DI SINI ---
              // Cari objek harga yang sesuai di dalam array `prices`
              const priceOption = productData?.prices?.find(p => p.size === size);
              const itemPrice = priceOption ? priceOption.price : 0; // Dapatkan harga dari objek yang ditemukan
              // --- AKHIR PERBAIKAN ---

              const totalItemPrice = itemPrice * quantity;

              // --- PERBAIKAN DI SINI ---
              // Cari objek berat yang sesuai di dalam array `prices`
              const weightOption = productData?.prices?.find(p => p.size === size);
              const itemWeight = weightOption ? weightOption.weight : 0; // Dapatkan berat dari objek yang ditemukan
              // --- AKHIR PERBAIKAN ---

              return (
                quantity > 0 && ( // Tampilkan hanya jika quantity lebih dari 0
                  <div key={`${itemId}-${size}`} className="flexBetween"> {/* Gunakan key yang lebih unik */}
                    <p>
                      {productData
                        ? `${productData.name} (${size}) ${itemWeight} gram x ${quantity}` // Gunakan itemWeight
                        : "Item Not Found"}
                    </p>
                    <p className="text-right">{formatToIDR(totalItemPrice)}</p>
                  </div>
                )
              );
            })
          )
        )}
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />

      {/* Shipping Fee */}
      <div className="flexBetween pt-3">
        <h5 className="h5">Biaya Pengiriman:</h5>
        <p className="h5">{formatToIDR(shippingCost || 0)}</p>
      </div>

      {/* Total Berat */}
      <div className="flexBetween pt-3">
        <h5 className="h5">Total Berat: </h5>
        <p className="h5">{getWeightAmount()} gram</p>
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />

      {/* Total */}
      <div className="flexBetween pt-3">
        <h5 className="h5">Total:</h5>
        <p className="h5">{formatToIDR(total)}</p>
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />
    </div>
  );
};

// ✅ Tambahkan validasi props di sini
CartTotal.propTypes = {
  shippingCost: PropTypes.number.isRequired,
};

export default CartTotal;

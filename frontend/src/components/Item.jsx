/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { TbShoppingBagPlus } from "react-icons/tb";
import { ShopContext } from "../context/ShopContextDef";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Fungsi untuk memformat harga sesuai currency
const formatCurrency = (amount, currency = "IDR") => {
  const validCurrency = ["IDR", "USD", "EUR"];

  const safeCurrency = validCurrency.includes(currency.toUpperCase())
    ? currency.toUpperCase()
    : "IDR";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const Item = ({ food }) => {
  const { currency, addToCart } = useContext(ShopContext);

  // Inisialisasi `size` dengan ukuran pertama yang tersedia jika ada, atau null
  const [selectedSize, setSelectedSize] = useState(
    food.prices && food.prices.length > 0 ? food.prices[0].size : null
  );

  // Update selectedSize jika food.prices berubah dan ukuran yang dipilih tidak lagi valid
  useEffect(() => {
    if (food.prices && food.prices.length > 0) {
      const currentSelectedSizeExists = food.prices.some(
        (p) => p.size === selectedSize
      );
      if (!currentSelectedSizeExists) {
        setSelectedSize(food.prices[0].size); // Set ke ukuran pertama jika ukuran saat ini tidak ada
      }
    } else {
      setSelectedSize(null); // Tidak ada ukuran jika tidak ada harga
    }
  }, [food.prices, selectedSize]);

  // Cari objek harga/berat yang sesuai dengan `selectedSize` yang dipilih
  const selectedPriceOption = food.prices?.find((p) => p.size === selectedSize);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // MENCEGAH KLIK INI MERAMBAT KE PARENT
    if (!selectedSize || !selectedPriceOption) {
      toast.error("Silakan pilih ukuran produk terlebih dahulu.");
      return;
    }
    addToCart(food._id, selectedSize);
  };

  return (
    <div className="rounded-xl bg-white relative">
      {" "}
      {/* Ubah dari Link menjadi div */}
      {/* photos - Sekarang ini adalah Link */}
      <Link
        to={`/product/${food._id}`}
        className="flexCenter m-6 rounded-full absolute left-0 right-0 -top-[111px] block"
      >
        {" "}
        {/* Jadikan Link di sini */}
        <img
          src={food.image}
          alt={food.name}
          height={150}
          width={160}
          className="object-contain aspect-square rounded-xl"
        />
      </Link>
      {/* info */}
      <div className="mx-4 bg-white pt-20">
        {/* title and description */}
        <div className="py-3">
          {/* Tambahkan Link juga untuk judul */}
          <h4 className="bold-16 line-clamp-1 mb-1">{food.name}</h4>
          <div className="flex items-start justify-between pb-1">
            <h5 className="medium-14 mb-1">{food.categoryId?.name}</h5>
          </div>
          <p className="line-clamp-2">{food.description}</p>
        </div>

        {/* food size buttons */}
        <div className="flexBetween mb-2">
          <div className="flex gap-1">
            {food.prices && food.prices.length > 0 ? (
              [...food.prices]
                .sort((a, b) => {
                  const order = ["H", "F", "S", "M", "L", "XL"];
                  return order.indexOf(a.size) - order.indexOf(b.size);
                })
                .map((priceOption, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation(); // Penting untuk mencegah navigasi
                      setSelectedSize(priceOption.size);
                    }}
                    className={`${
                      priceOption.size === selectedSize
                        ? "ring-2 ring-secondary"
                        : ""
                    }
                                            h-6 w-8 bg-primary text-xs font-semibold rounded-sm`}
                  >
                    {priceOption.size}
                  </button>
                ))
            ) : (
              <p className="text-xs text-gray-500">Tidak ada ukuran</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="flexCenter gap-x-1 text-[18px] bg-secondary text-white rounded-sm p-[-3px]"
            disabled={!selectedSize || !selectedPriceOption}
          >
            <TbShoppingBagPlus />
          </button>
        </div>

        {/* order info */}
        <div className="flexAround rounded-xl pb-3 pt-3 text-[13px] font-semibold">
          <div className="flex flex-col gap-1">
            <h5>Weight</h5>
            <p className="text-xs">
              {selectedPriceOption ? selectedPriceOption.weight : "-"} gram
            </p>
          </div>
          <hr className="h-8 w-[1px] bg-tertiary/10 border-none" />
          <div className="flex flex-col gap-1">
            <h5>Price</h5>
            <p className="text-xs text-secondary">
              {selectedPriceOption
                ? formatCurrency(selectedPriceOption.price, currency)
                : formatCurrency(0, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;

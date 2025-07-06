import { useState, useContext, useEffect, useCallback } from "react";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContextDef";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { RiUserReceived2Fill } from "react-icons/ri";
import {
  FaPhone,
  FaStreetView,
  FaMap,
  FaCity,
  FaLocationDot,
  FaListOl,
} from "react-icons/fa6";
import api from "../context/api";
import { Modal, Button } from 'flowbite-react'; // Import Modal and Button from flowbite-react

const PlaceOrder = () => {
  const {
    navigate,
    items,
    setItems,
    getCartAmount,
    getWeightAmount,
    foods,
  } = useContext(ShopContext);

  const [shippingCost, setShippingCost] = useState(0);

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [formData, setFormData] = useState({
    receivedName: "",
    deliveryDate: "",
    phone: "",
    provinceId: "",
    regencyId: "",
    districtId: "",
    villageId: "",
    zipcode: "",
    street: "",
    messageOrder: "",
  });

  // State for the order summary popup
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderSummaryData, setOrderSummaryData] = useState(null); // Tetap dibutuhkan untuk mengirim data
  const [countdown, setCountdown] = useState(5);
  const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(true);

  // --- KOREKSI INI: SESUAIKAN DENGAN FORMAT KODE DARI API WILAYAH.ID ANDA ---
  // Pastikan kode ID di sini cocok dengan 'code' yang dikembalikan oleh API
  const JABODETABEK_REGENCY_IDS = {
    // DKI Jakarta (Provinsi Code: "31")
    "31": ["31.71", "31.72", "31.73", "31.74", "31.75", "31.01"], 
    // Jawa Barat (Provinsi Code: "32")
    "32": ["32.01", "32.71", "32.76", "32.75", "32.16"], 
    // Banten (Provinsi Code: "36")
    "36": ["36.03", "36.71", "36.74"], 
  };
  
  // Ambil semua kunci (ID Provinsi) dari JABODETABEK_REGENCY_IDS
  const JABODETABEK_PROVINCE_IDS = Object.keys(JABODETABEK_REGENCY_IDS);


  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const fetchShippingCost = async (destinationZipcode) => {
    if (!destinationZipcode || destinationZipcode.length < 5) {
      setShippingCost(0);
      return;
    }

    try {
      const response = await api.post("/api/wilayah/cek-ongkir", {
        origin: "17116",
        destination: destinationZipcode,
        weight: Math.max(getWeightAmount(), 1),
        courier: "jne",
      });

      console.log(response);
      const data = response.data;
      if (data.success && data.cheapestService) {
        setShippingCost(data.cheapestService.cost);
      } else {
        toast.warning(data.message || "Tidak ada data ongkir tersedia.");
        setShippingCost(0);
      }
    } catch (error) {
      console.error("Gagal mendapatkan ongkir:", error);
      toast.error("Gagal mendapatkan ongkir. Pastikan kode pos benar.");
      setShippingCost(0);
    }
  };

  const debouncedFetchShippingCost = useCallback(
    debounce(fetchShippingCost, 700),
    []
  );

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await api.get("/api/wilayah/provinsi");
        if (response.data && response.data.data) {
          const filteredProvinces = response.data.data.filter(prov => 
            JABODETABEK_PROVINCE_IDS.includes(prov.code)
          );
          setProvinces(filteredProvinces);
        } else {
          console.warn("API response for provinces is not in expected format:", response.data);
          toast.warning("Gagal memuat daftar provinsi: Data tidak sesuai.");
          setProvinces([]);
        }
      } catch (error) {
        console.error("Gagal memuat provinsi:", error);
        toast.error("Gagal memuat daftar provinsi.");
        setProvinces([]);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    if (formData.provinceId) {
      const loadRegencies = async () => {
        try {
          const response = await api.get(
            `/api/wilayah/kabupaten/${formData.provinceId}`
          );
          if (response.data && response.data.data) {
            // Filter kabupaten/kota hanya yang termasuk Jabodetabek berdasarkan provinsi yang dipilih
            const allowedRegsForProvince = JABODETABEK_REGENCY_IDS[formData.provinceId] || [];
            const filteredRegencies = response.data.data.filter(reg =>
              allowedRegsForProvince.includes(reg.code)
            );
            setRegencies(filteredRegencies);
            setDistricts([]);
            setVillages([]);
            setFormData((prev) => ({
              ...prev,
              regencyId: "",
              districtId: "",
              villageId: "",
              zipcode: "",
            }));
          } else {
            console.warn("API response for regencies is not in expected format:", response.data);
            setRegencies([]);
          }
        } catch (error) {
          console.error("Gagal memuat kabupaten/kota:", error);
          toast.error("Gagal memuat daftar kabupaten/kota.");
          setRegencies([]);
        }
      };
      loadRegencies();
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      setFormData((prev) => ({
        ...prev,
        regencyId: "",
        districtId: "",
        villageId: "",
        zipcode: "",
      }));
    }
  }, [formData.provinceId]);

  useEffect(() => {
    if (formData.regencyId) {
      const loadDistricts = async () => {
        try {
          const response = await api.get(
            `/api/wilayah/kecamatan/${formData.regencyId}`
          );
          if (response.data && response.data.data) {
            setDistricts(response.data.data);
            setVillages([]);
            setFormData((prev) => ({
              ...prev,
              districtId: "",
              villageId: "",
              zipcode: "",
            }));
          } else {
            console.warn("API response for districts is not in expected format:", response.data);
            setDistricts([]);
          }
        } catch (error) {
          console.error("Gagal memuat kecamatan:", error);
          toast.error("Gagal memuat daftar kecamatan.");
          setDistricts([]);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setVillages([]);
      setFormData((prev) => ({
        ...prev,
        districtId: "",
        villageId: "",
        zipcode: "",
      }));
    }
  }, [formData.regencyId]);

  useEffect(() => {
    if (formData.districtId) {
      const loadVillagesAndSetZipcode = async () => {
        try {
          const response = await api.get(
            `/api/wilayah/kelurahan/${formData.districtId}`
          );
          if (response.data && response.data.data && response.data.data.length > 0) {
            setVillages(response.data.data);
            setFormData((prev) => ({
              ...prev,
              zipcode: response.data.data[0].postal_code || "", 
              villageId: "",
            }));
          } else {
            const selectedDistrict = districts.find(
              (d) => d.code === formData.districtId 
            );
            setFormData((prev) => ({
              ...prev,
              zipcode: selectedDistrict?.postal_code || "", 
              villageId: "",
            }));
            setVillages([]);
          }
        } catch (error) {
          console.error("Gagal memuat kelurahan:", error);
          toast.error("Gagal memuat daftar kelurahan.");
          setVillages([]);
          setFormData((prev) => ({ ...prev, villageId: "", zipcode: "" }));
        }
      };
      loadVillagesAndSetZipcode();
    } else {
      setVillages([]);
      setFormData((prev) => ({ ...prev, villageId: "", zipcode: "" }));
    }
  }, [formData.districtId, districts]);

  useEffect(() => {
    if (formData.zipcode && formData.zipcode.length === 5) {
      debouncedFetchShippingCost(formData.zipcode);
    } else {
      setShippingCost(0);
    }
  }, [formData.zipcode, debouncedFetchShippingCost]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (showOrderSummary && countdown > 0) { // Hanya jalankan countdown jika modal terlihat
      setIsConfirmButtonDisabled(true); // Pastikan tombol disabled saat countdown berjalan
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showOrderSummary) { // Countdown selesai dan modal masih terlihat
      setIsConfirmButtonDisabled(false); // Aktifkan tombol saat countdown selesai
    }
    return () => clearTimeout(timer);
  }, [countdown, showOrderSummary]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (
      !formData.receivedName ||
      !formData.phone || 
      !formData.provinceId || 
      !formData.regencyId || 
      !formData.districtId ||
      !formData.villageId || 
      !formData.zipcode || 
      !formData.street
    ) {
      toast.error("Harap lengkapi semua informasi pengiriman!");
      return;
    }

    if (getCartAmount() === 0) {
        toast.error("Keranjang belanja Anda kosong!");
        return;
    }

    const orderItems = Object.entries(items).reduce(
      (acc, [itemId, sizes]) => {
        const itemInfo = foods.find((food) => food._id === itemId);
        if (!itemInfo) return acc;

        Object.entries(sizes).forEach(([size, qty]) => {
          if (qty > 0) {
            const priceOption = itemInfo.prices?.find(p => p.size === size);
            const itemPrice = priceOption ? priceOption.price : 0;
            const itemWeight = priceOption ? priceOption.weight : 0;

            if (itemPrice <= 0) {
              console.error(
                `Invalid price for item: ${itemInfo.name} - ${size}`,
                itemInfo
              );
            }

            acc.push({
              _id: itemInfo._id,
              name: itemInfo.name,
              size,
              weight: itemWeight,
              quantity: qty,
              price: itemPrice,
              image: itemInfo.image,
              totalPrice: itemPrice * qty,
            });
          }
        });
        return acc;
      },
      []
    );

    if (orderItems.length === 0) {
      toast.error("Keranjang belanja Anda kosong atau item tidak valid!");
      return;
    }

    const selectedProvince = provinces.find(p => p.code === formData.provinceId)?.name;
    const selectedRegency = regencies.find(r => r.code === formData.regencyId)?.name;
    const selectedDistrict = districts.find(d => d.code === formData.districtId)?.name;
    const selectedVillage = villages.find(v => v.code === formData.villageId)?.name;

    // Prepare data for the summary and eventual order
    const orderData = {
        address: {
            street: formData.street,
            village: selectedVillage || '',
            district: selectedDistrict || '',
            regency: selectedRegency,    
            province: selectedProvince,  
            zipcode: formData.zipcode,
        },
        receivedName: formData.receivedName,
        recipientPhone: formData.phone,
        deliveryDate: formData.deliveryDate,
        shippingCost,
        items: orderItems,
        amount: getCartAmount(),
        totalAmount: getCartAmount() + shippingCost,
        totalWeight: getWeightAmount(),
        messageOrder: formData.messageOrder,
    };

    // Set summary data and show the modal
    setOrderSummaryData(orderData); // Tetap simpan data untuk dikirim ke API
    setShowOrderSummary(true);
    setCountdown(5); // Reset countdown
    setIsConfirmButtonDisabled(true); // Pastikan tombol diawali disabled
  };

  const handleConfirmOrder = async () => {
    // Tombol ini hanya akan terpanggil jika countdown sudah 0 dan isConfirmButtonDisabled adalah false
    if (isConfirmButtonDisabled || !orderSummaryData) {
      return; // Hindari eksekusi jika tombol masih disabled atau data tidak ada
    }

    try {
      const orderResponse = await api.post("/api/order/place", orderSummaryData);
      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || "Gagal membuat pesanan!");
        return;
      }

      setItems({}); // Clear cart
      setFormData({ // Reset form
        receivedName: "",
        messageOrder: "",
        phone: "",
        provinceId: "", 
        regencyId: "",  
        districtId: "",
        villageId: "",
        zipcode: "",
        street: "",
        deliveryDate: "",
      });

      toast.success("Pesanan berhasil dibuat!");
      setShowOrderSummary(false); // Close modal
      navigate("/orders"); // Redirect to orders page
    } catch (error) {
      console.error(error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400)
          toast.error(data.message || "Permintaan tidak valid!");
        else if (status === 500)
          toast.error("Kesalahan server, coba lagi nanti.");
      } else {
        toast.error("Terjadi kesalahan koneksi.");
      }
    } finally {
      setIsConfirmButtonDisabled(true); // Reset button state
      setCountdown(5); // Reset countdown
    }
  };

  const handleCancelOrder = () => {
    setShowOrderSummary(false);
    setIsConfirmButtonDisabled(true); // Reset button state
    setCountdown(5); // Reset countdown
    toast.info("Pembuatan pesanan dibatalkan.");
  };

  return (
    <section className="max-padd-container mt-24">
      <form onSubmit={onSubmitHandler} className="py-6">
        <div className="flex flex-col xl:flex-row gap-20 xl:gap-28">
          <div className="flex flex-1 flex-col gap-3 text-[95%]">
            <Title
              title1={"Informasi"}
              title2={"Pengiriman"}
              title1Styles={"h3"}
            />

            <div className="flex gap-6 mb-4">
              <div className="relative z-0 w-3/6 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <RiUserReceived2Fill className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    onChange={onChangeHandler}
                    value={formData.receivedName}
                    type="text"
                    name="receivedName"
                    placeholder=""
                    id="receivedName"
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="receivedName"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Nama Penerima
                  </label>
                </div>
              </div>

              <div className="relative z-0 w-2/6 group">
                <div className="relative">
                  <input
                    onChange={onChangeHandler}
                    value={formData.deliveryDate}
                    type="date"
                    name="deliveryDate"
                    id="deliveryDate"
                    placeholder="Tanggal pengiriman"
                    min={dayAfterTomorrow.toISOString().split("T")[0]}
                    className="block py-2.5 px-0 w-full text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="deliveryDate"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Tanggal Pengiriman
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-6 mb-4">
              <div className="relative z-0 w-[50%] group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaPhone className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    onChange={onChangeHandler}
                    value={formData.phone}
                    type="tel"
                    name="phone"
                    placeholder=""
                    id="phone"
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="phone"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Nomor Telepon
                  </label>
                </div>
              </div>
            </div>

            <div className="relative z-0 w-[88%] mb-4 group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaStreetView className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  onChange={onChangeHandler}
                  value={formData.street}
                  type="text"
                  name="street"
                  id="street"
                  placeholder=""
                  className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:focus:border-blue-600 peer"
                />
                <label
                  htmlFor="street"
                  className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Detail Alamat (Jalan, No. Rumah, RT/RW)
                </label>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Provinsi */}
              <div className="relative z-0 w-[29%] mb-4 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaMap className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    onChange={onChangeHandler}
                    value={formData.provinceId}
                    name="provinceId"
                    id="provinceId"
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
                        {" "}
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="provinceId"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Provinsi
                  </label>
                </div>
              </div>

              {/* Kabupaten/Kota */}
              <div className="relative z-0 w-[29%] mb-4 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaCity className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    onChange={onChangeHandler}
                    value={formData.regencyId}
                    name="regencyId"
                    id="regencyId"
                    disabled={!formData.provinceId}
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  >
                    <option value="">Pilih Kota/Kabupaten</option>
                    {regencies.map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {" "}
                        {reg.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="regencyId"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Kota/Kabupaten
                  </label>
                </div>
              </div>

              {/* Kecamatan */}
              <div className="relative z-0 w-[29%] mb-4 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaListOl className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    onChange={onChangeHandler}
                    value={formData.districtId}
                    name="districtId"
                    id="districtId"
                    disabled={!formData.regencyId}
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districts.map((dist) => (
                      <option key={dist.code} value={dist.code}>
                        {" "}
                        {dist.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="districtId"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Kecamatan
                  </label>
                </div>
              </div>

              {/* Kelurahan (Opsional, akan mengisi kode pos) */}
              <div className="relative z-0 w-[29%] mb-4 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLocationDot className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    onChange={(e) => {
                      const selectedVillage = villages.find(
                        (v) => v.code === e.target.value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        villageId: e.target.value,
                        zipcode: selectedVillage?.postal_code || "",
                      }));
                    }}
                    value={formData.villageId}
                    name="villageId"
                    id="villageId"
                    disabled={!formData.districtId || villages.length === 0}
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  >
                    <option value="">Pilih Kelurahan (Opsional)</option>
                    {villages.map((vil) => (
                      <option key={vil.code} value={vil.code}>
                        {vil.name} (Kode Pos: {vil.postal_code}){" "}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="villageId"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Kelurahan
                  </label>
                </div>
              </div>

              {/* Kode Pos (otomatis terisi dan disabled) */}
              <div className="relative z-0 w-[29%] mb-4 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLocationDot className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="zipcode"
                    id="zipcode"
                    value={formData.zipcode}
                    readOnly
                    disabled
                    placeholder=""
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="zipcode"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Kode Pos
                  </label>
                </div>
              </div>
            </div>
            
            <div className="relative z-0 mb-4 mt-2 group">
              <textarea
                type="messageOrder"
                rows="1"
                id="messageOrder"
                name="messageOrder"
                onChange={onChangeHandler}
                value={formData.messageOrder}
                placeholder=" "
                onFocus={(e) => (e.target.rows = 4)}
                onBlur={(e) => e.target.value === "" && (e.target.rows = 1)}
                className="block py-2.5 px-0 w-[88%] text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-secondary focus:outline-none focus:ring-0 focus:border-secondary peer"
              />
              <label
                htmlFor="messageOrder"
                className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-secondary peer-focus:dark:text-secondary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Catatan Order
              </label>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <CartTotal
              shippingCost={shippingCost}
            />
            <div>
              <button type="submit" className="btn-dark !rounded mt-4">
                Buat pesanan
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Order Summary Modal */}
      <Modal show={showOrderSummary} onClose={handleCancelOrder}>
        <Modal.Header>Apakah pesanan Anda telah sesuai?</Modal.Header>
        <Modal.Body>
          {/* Bagian ringkasan pesanan dihilangkan dari sini */}
          <p className="text-lg text-gray-800">
            Pastikan semua informasi yang Anda masukkan sudah benar sebelum melanjutkan.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-between items-center">
          <Button color="failure" onClick={handleCancelOrder}>
            Batalkan
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Konfirmasi dalam {countdown} detik...</span> {/* Teks lebih singkat */}
            <Button onClick={handleConfirmOrder} disabled={isConfirmButtonDisabled}>
              Konfirmasi Pesanan
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Footer />
    </section>
  );
};

export default PlaceOrder;
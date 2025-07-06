import { useContext, useCallback, useEffect, useState } from 'react'
import { RiSearch2Line } from 'react-icons/ri'
import { LuSettings2 } from 'react-icons/lu'
import Title from '../components/Title'
import Item from '../components/Item'
import Footer from '../components/Footer'
import { ShopContext } from '../context/ShopContextDef'
import api from '../context/api';

const Menu = () => {

  const {foods} = useContext(ShopContext) // foods diambil dari ShopContext

  const [apiCategories, setApiCategories] = useState([]); 

  const [category, setCategory] = useState([]) // Ini masih array untuk multi-select (checkbox)
  const [sortType, setSortType] = useState("relevant")
  const [filteredFoods, setFilteredFoods] = useState([])
  const [showCategories, setShowCategories] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  const toggleFilter = (value, setState) => {
    setState((prev)=>
      prev.includes(value) ? prev.filter((item) => item !==value) : [...prev,value]
    )
  }

  const getSafePrice = useCallback((foodItem) => {
    if (!foodItem || !foodItem.price) {
      return 0; 
    }
    // Jika price adalah objek dengan ukuran sebagai kunci, ambil harga terkecil
    const prices = Object.values(foodItem.price); 
    if (prices.length === 0) {
      return 0; 
    }
    return Math.min(...prices);
  }, []); 

  // Fungsi yang di-memoize untuk menerapkan filter (termasuk status 'Active')
  const applyFilters = useCallback(() => {
    // Mulai dengan semua makanan, kemudian filter berdasarkan status 'Active'
    let filtered = foods.filter(food => food.status === 'Active'); 

    // Terapkan filter pencarian jika ada teks pencarian
    if (search) {
      filtered = filtered.filter((food) =>
        food.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Terapkan filter kategori jika ada kategori yang dipilih
    if (category.length) {
      filtered = filtered.filter((food) => {
        // --- PERBAIKAN UTAMA DI SINI ---
        // Kita tahu food.categoryId adalah objek { _id, name }.
        // Kita membandingkan ID yang dipilih (ada di state `category`)
        // dengan food.categoryId._id
        return food.categoryId && category.includes(food.categoryId._id);
      });
    }
    return filtered;
  }, [foods, search, category]); // Dependensi: foods, search, category

  const applySorting = useCallback(
    (foodsList) => {
      const sortedFoods = [...foodsList]; 
      switch (sortType) {
        case "low":
          return sortedFoods.sort((a, b) => {
            const aPrice = getSafePrice(a);
            const bPrice = getSafePrice(b);
            return aPrice - bPrice;
          });
        case "high":
          return sortedFoods.sort((a, b) => {
            const aPrice = getSafePrice(a);
            const bPrice = getSafePrice(b);
            return bPrice - aPrice;
          });
        default:
          return sortedFoods;
      }
    },
    [sortType, getSafePrice]
  );

  const toggleShowCategories = () => {
    setShowCategories(!showCategories)
  }

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const paginatedFoods = filteredFoods.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories'); 
      console.log("Respons API Kategori:", response.data);
      if (response.data.success) {
        setApiCategories(response.data.data || []); 
      } else {
        console.error("Gagal mengambil kategori:", response.data.message);
        setApiCategories([]); 
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setApiCategories([]);
    }
  }, []); 

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); 

  useEffect(() => {
    if (!foods || foods.length === 0) {
      setFilteredFoods([]); 
      return;
    }
    let filtered = applyFilters();
    let sorted = applySorting(filtered);
    setFilteredFoods(sorted);
    setCurrentPage(0);
  }, [category, sortType, foods, search, applyFilters, applySorting]); 
  
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage)

  return (
    <section className='max-padd-container mt-24'>
      {/* Kotak Pencarian */}
      <div className='w-full max-w-2xl flexCenter'>
        <div className='inline-flex items-center justify-center
          bg-white overflow-hidden w-full rounded-full p-4 px-5'>
          <div className='text-lg cursor-pointer'><RiSearch2Line /></div>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} type="text" placeholder='Cari di sini...' 
          className='border-none outline-none focus:ring-0 w-full text-sm pl-4' autoFocus />
          <div onClick={toggleShowCategories} className='flexCenter cursor-pointer text-lg border-1 pl-2'><LuSettings2 /></div>
        </div>
      </div>

      {/* Filter Kategori */}
      {showCategories && (
        <div className='my-14'>
          <h3 className='h4 mb-4 hidden sm:flex'>Kategori:</h3>
          <div className='flexCenter sm:flexStart flex-wrap gap-x-12 gap-y-4'>
            {apiCategories && apiCategories.length > 0 ? (
              apiCategories.map((cat) => (
                <label key={cat._id}>
                  {/* Pastikan ini menggunakan `cat._id` karena `category` state menyimpan ID */}
                  <input value={cat._id} onChange={(e) => toggleFilter(e.target.value, setCategory)} type="checkbox" className='hidden peer' />
                  <div className='flexCenter flex-col gap-2 peer-checked:text-secondary cursor-pointer'>
                    <div className='bg-white h-20 w-20 flexCenter rounded-full'>
                      <img src={cat.image || 'https://placehold.co/40x40/cccccc/000000?text=No+Img'} alt={cat.name} className='object-cover h-10 w-10' />
                    </div>
                    <span className='medium-14'>{cat.name}</span>
                  </div>
                </label>
              ))
            ) : (
              <p className="medium-14 text-gray-500">Memuat kategori atau tidak ada kategori tersedia...</p>
            )}
          </div>
        </div>
      )}

      {/* Kontainer Daftar Makanan */}
      <div className='my-8 mb-20'>
        {/* Judul dan Opsi Penyortiran */}
        <div className='flexBetween !items-start gap-7 flex-wrap pb-16 max-sm:flexCenter text-center max-sm:pb-24'>
          <Title title1={'Daftar'} title2={'Makanan Kami'} titleStyles={'!pb-0'} paraStyles={'!block'} />
          <div className='flexCenter gap-x-2'>
            <span className='hidden sm:flex medium-16'>Urutkan berdasarkan:</span>
            <select onChange={(e)=>setSortType(e.target.value)} className='text-sm p-2.5 outline-none bg-white text-gray-30 rounded cursor-pointer'>
              <option value="relevant">Relevan</option>
              <option value="low">Harga Terendah</option>
              <option value="high">Harga Tertinggi</option>
            </select>
          </div>
        </div>
        {/* Daftar Makanan (Item) */}
        <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 
          lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-36 mt-14 xl:mt-28'>
          {paginatedFoods.length > 0 ?(
            paginatedFoods.map((food) => (
              <Item food={food} key={food._id} />
            ))
          ):(
            <p className='capitalize'>Tidak ada makanan ditemukan untuk filter yang dipilih</p>
          )}
        </div>
        {/* Paginasi */}
        <div className='flexCenter mt-8'>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`px-4 py-2 mx-1 ${currentPage === index ? 'bg-secondary text-white' : 'bg-white text-gray-30'} rounded`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </section>
  )
}

export default Menu;

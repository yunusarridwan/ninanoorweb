import { useContext, useState } from 'react'; // Pastikan useContext dan useState diimpor
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { CgMenuLeft } from 'react-icons/cg';
import { TbUserCircle, TbArrowNarrowRight } from 'react-icons/tb';
import { RiUserLine, RiShoppingBag4Line } from 'react-icons/ri';
import { ShopContext } from '../context/ShopContextDef';
import { Modal, Button } from 'flowbite-react'; // <<< IMPORT MODAL DAN BUTTON DARI FLOWBITE REACT
import { toast } from 'react-toastify'; // <<< IMPORT TOAST UNTUK NOTIFIKASI SUKSES

const Header = () => {
  const { token, setToken, navigate, getCartCount, logout } = useContext(ShopContext);
  const [menuOpened, setMenuOpened] = useState(false);
  // --- TAMBAHAN BARU: State untuk mengontrol visibilitas modal logout ---
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  const toggleMenu = () => {
    setMenuOpened((prev) => !prev);
  };

  // --- MODIFIKASI FUNGSI LOGOUT YANG ADA ---
  const logoutButton = () => {
    setShowLogoutModal(true); // Ketika 'Logout' diklik, tampilkan modal konfirmasi
  };

  // --- FUNGSI BARU: Untuk konfirmasi logout yang sebenarnya ---
  const confirmLogout = () => {
    setShowLogoutModal(false); // Tutup modal konfirmasi
    navigate('/login');
    logout();
    localStorage.removeItem('token');
    setToken('');
    toast.success("Anda telah berhasil keluar dari akun."); // Notifikasi sukses setelah logout
  };

  // --- FUNGSI BARU: Untuk membatalkan logout ---
  const cancelLogout = () => {
    setShowLogoutModal(false); // Tutup modal
  };
  // --- AKHIR FUNGSI BARU ---


  return (
    <header className='py-3 w-full absolute top-0 right-0 left-0 z-50 bg-white'>
      <div className='max-padd-container flexBetween'>

        {/* logo */}
        <Link to={'/'} className='bold-24 flex-1 flex items-baseline'>
          <h1 className='text-logo'>Ninanoor</h1>
        </Link>

        {/* navbar */}
        <div className='flex-1'>
          <Navbar menuOpened={menuOpened} toggleMenu={toggleMenu}
            containerStyles={`${menuOpened
              ? 'flex flex-col gap-y-12 h-screen w-[222px] fixed left-0 top-0 bg-white z-50 px-10 py-4 shadow-xl'
              : 'hidden xl:flex gap-x-5 xl:gap-x-8 medium-15 rounded-full px-2 py-1'} `}
          />
        </div>

        {/* right side */}
        <div className='flex-1 flex items-center justify-end gap-x-3 sm:gap-x-10'>
          {!menuOpened && (<CgMenuLeft onClick={toggleMenu} className='text-2xl xl:hidden cursor-pointer' />)}
          <Link to={'/cart'} className='flex relative'>
            <RiShoppingBag4Line className='text-2xl' />
            <span className='bg-secondary text-white medium-14 absolute left-3.5
              -top-2.5 flexCenter w-4 h-4 rounded-full shadow-inner'>{getCartCount()}</span>
          </Link>
          <div className='group relative'>
            <div onClick={() => !token && navigate('/login')}>
              {
                token
                  ? (<div className='my-[9px]'>
                    <TbUserCircle className='text-[29px] cursor-pointer' />
                  </div>)
                  : (<button className='btn-outline !border-none flexCenter gap-x-2'>
                    Login<RiUserLine className='text-xl' />
                  </button>)
              }
            </div>
            {token && <>
              <ul className='bg-white shadow-sm p-2 w-32 ring-1 ring-slate-900/15
              rounded absolute right-0 top-10 hidden group-hover:flex flex-col'>
                <li onClick={() => navigate('/orders')} className='flexBetween cursor-pointer'>
                  <p>Orders</p><TbArrowNarrowRight className='opacity-50 text-[19px]' />
                </li>
                <hr className='my-2' />
                <li onClick={() => navigate('/my-reviews')} className='flexBetween cursor-pointer'>
                  <p>Ulasan</p><TbArrowNarrowRight className='opacity-50 text-[19px]' />
                </li>
                <hr className='my-2' />
                <li onClick={logoutButton} className='flexBetween cursor-pointer'> {/* Ini memanggil fungsi logout yang baru */}
                  <p>Logout</p><TbArrowNarrowRight className='opacity-50 text-[19px]' />
                </li>
              </ul>
            </>}
          </div>
        </div>
      </div>

      {/* --- MODAL KONFIRMASI LOGOUT DARI FLOWBITE REACT --- */}
      <Modal show={showLogoutModal} onClose={cancelLogout}>
        <Modal.Header>Konfirmasi Logout</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin keluar dari akun?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={confirmLogout}>Ya, Logout!</Button> {/* Tombol Konfirmasi */}
          <Button color="gray" onClick={cancelLogout}>Batal</Button> {/* Tombol Batal */}
        </Modal.Footer>
      </Modal>
      {/* --- AKHIR MODAL KONFIRMASI LOGOUT --- */}
    </header>
  );
};

export default Header;
import { useContext, useState, useEffect } from "react";
import loginImg from "../assets/login.jpg";
import signupImg from "../assets/signup.jpg";
import { ShopContext } from "../context/ShopContextDef";
import { toast } from "react-toastify";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { AiFillEye, AiFillEyeInvisible, AiOutlineClose } from "react-icons/ai";
import { BsFillTelephoneFill } from "react-icons/bs";
import api from "../context/api"; // Pastikan ini mengarah ke instance Axios Anda
import { Modal } from "flowbite-react";
import ForgotPassword from "./ForgotPassword";
import { jwtDecode } from "jwt-decode"; // Pastikan jwt-decode terinstal

const Login = () => {
  const { token, setToken, navigate } = useContext(ShopContext);

  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const [currState, setCurrState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telpn, setTelpn] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk validasi form
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/; // Minimal 6 karakter apapun
    const telpnRegex = /^[0-9]{10,15}$/; // Regex untuk 10-15 digit angka

    // Cek semua field yang diperlukan berdasarkan state form saat ini
    if (
      !email.trim() ||
      !password.trim() ||
      (currState === "Sign Up" && !username.trim()) ||
      (currState === "Sign Up" && !telpn.trim())
    ) {
      toast.error("Semua kolom wajib diisi!");
      return false;
    }

    // Validasi format email
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid!");
      return false;
    }

    // Validasi format password
    if (!passwordRegex.test(password)) {
      toast.error("Password harus minimal 6 karakter!");
      return false;
    }

    // Validasi nomor telepon hanya jika di mode Sign Up
    if (currState === "Sign Up" && !telpnRegex.test(telpn)) {
      toast.error("Nomor telepon tidak valid (10-15 digit angka)!");
      return false;
    }

    return true;
  };

  // Handler saat form disubmit
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;
      if (currState === "Sign Up") {
        // Kirim data register ke backend
        response = await api.post("/api/user/register", {
          username,
          email,
          telpn,
          password,
        });

        if (response.data.success) {
          // *** PERUBAHAN UTAMA DI SINI ***
          toast.success("Akun berhasil didaftarkan! Silakan login."); // Notifikasi berhasil daftar
          setCurrState("Login"); // Alihkan state form ke "Login"
          // Kosongkan input fields setelah register sukses agar bisa langsung diisi untuk login
          setUsername("");
          setEmail("");
          setPassword("");
          setTelpn("");
          // Jangan set token atau redirect ke home karena pengguna belum login
        } else {
          toast.error(response.data.message); // Tampilkan pesan error dari backend
        }
      } else { // Ini adalah kondisi untuk currState === "Login"
        // Kirim data login ke backend
        response = await api.post("/api/user/login", { email, password });

        if (response.data.success) {
          const token = response.data.token;
          setToken(token); // Simpan token di state global
          localStorage.setItem("token", token); // Simpan token di localStorage

          let userNameToDisplay = "User"; // Default nama
          try {
            const decoded = jwtDecode(token);
            // Backend Anda mengirim 'username' di dalam token
            userNameToDisplay = decoded.username || response.data.user?.username || username || "User";
          } catch (decodeError) {
            console.warn("Could not decode token:", decodeError);
            // Fallback ke nama dari respons data (jika ada) atau 'User'
            userNameToDisplay = response.data.user?.username || username || "User";
          }

          toast.success(`Selamat datang, ${userNameToDisplay}!`); // Tampilkan toast dengan nama pengguna
          navigate("/"); // Arahkan ke halaman utama HANYA SETELAH LOGIN SUKSES
        } else {
          toast.error(response.data.message); // Tampilkan pesan error dari backend
        }
      }
    } catch (error) {
      // Tangani error dari API request
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi."); // Pesan error umum
      }
    } finally {
      setIsLoading(false); // Akhiri loading state
    }
  };

  // Fungsi untuk beralih antara Login dan Sign Up
  const toggleForm = () => {
    setCurrState(currState === "Login" ? "Sign Up" : "Login");
    // Reset input fields saat beralih form
    setUsername("");
    setEmail("");
    setPassword("");
    setTelpn("");
    setShowPassword(false);
  };

  // Efek samping untuk navigasi jika pengguna sudah login
  useEffect(() => {
    // Jika token sudah ada (misalnya dari localStorage saat refresh), langsung arahkan ke home
    if (token) {
      navigate("/");
    }
  }, [token, navigate]); // Dependensi: token dan navigate

  return (
    <section className="absolute top-0 left-0 h-full w-full z-50 bg-white">
      {/* Tombol X untuk kembali ke Home */}
      <button
        onClick={() => navigate("/")}
        className={`absolute top-4 ${
          currState === "Sign Up" ? "left-4" : "right-4"
        } bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full transition duration-300`}
      >
        <AiOutlineClose className="text-xl" />
      </button>

      {/* Kontainer Utama Form dan Gambar */}
      <div
        className={`flex h-full w-full transition-all duration-700 ${
          currState === "Sign Up" ? "flex-row-reverse" : ""
        }`}
      >
        {/* Bagian Gambar (Hidden on small screens) */}
        <div className="w-1/2 hidden sm:block relative">
          <img
            src={loginImg}
            alt="Login"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              currState === "Sign Up" ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src={signupImg}
            alt="Signup"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              currState === "Sign Up" ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Bagian Form */}
        <div className="flex w-full sm:w-1/2 items-center justify-center">
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800"
          >
            <div className="w-full mb-2 relative z-0 group">
              <h3 className="bold-36 mb-2">{currState}</h3>
            </div>

            {currState === "Sign Up" && (
              <div className="relative z-0 w-full group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MdPerson className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="username"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Username
                  </label>
                </div>
              </div>
            )}

            {currState === "Sign Up" && (
              <div className="relative z-0 w-full group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <BsFillTelephoneFill className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="telpn"
                    value={telpn}
                    onChange={(e) => setTelpn(e.target.value)}
                    className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="telpn"
                    className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    No Telepon
                  </label>
                </div>
              </div>
            )}

            {/* Input Email Address */}
            <div className="relative z-0 w-full group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdEmail className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full py-2.5 pl-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Email Address
                </label>
              </div>
            </div>

            {/* Input Password */}
            <div className="relative z-0 w-full group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdLock className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full py-2.5 pl-10 pr-10 text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="password"
                  className="peer-focus:font-medium absolute text-m text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Password
                </label>
                {/* Tombol Show/Hide Password */}
                <button
                  type="button"
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 
                    ${
                      password
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  onClick={() => password && setShowPassword(!showPassword)}
                  disabled={!password}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
            </div>

            {/* Link Lupa Password */}
            {currState === "Login" && (
              <div className="w-full flex justify-end text-sm">
                <button
                  type="button"
                  onClick={() => setOpenForgotPassword(true)}
                  className="flex text-sm cursor-pointer hover:text-secondary"
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              className="btn-dark w-full !py-[7px] !rounded"
              disabled={isLoading}
            >
              {isLoading
                ? "Memproses..."
                : currState === "Sign Up"
                ? "Daftar"
                : "Login"}
            </button>
            
            {/* Teks Beralih Form */}
            <div className="w-full flex flex-col gap-y-3 medium-14">
              <div className="underline">
                {currState === "Sign Up"
                  ? "Sudah punya akun?"
                  : "Belum punya akun?"}
                <span
                  onClick={toggleForm}
                  className="cursor-pointer text-secondary"
                >
                  {currState === "Sign Up" ? " Login" : " Buat Akun"}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Lupa Password */}
      <Modal
        show={openForgotPassword}
        size="md"
        onClose={() => setOpenForgotPassword(false)}
      >
        <Modal.Header>Lupa Password</Modal.Header>
        <Modal.Body>
          <ForgotPassword closeModal={() => setOpenForgotPassword(false)} />
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Login;
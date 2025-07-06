// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OrderDetail from "./pages/OrderDetail"; 
import ReviewForm from "./pages/ReviewForm";
import ProductDetail from "./pages/ProductDetail";
import UserReviews from "./pages/UserReviews";
import NotFound from "./pages/NotFound"; // Import komponen NotFound Anda

const App = () => {
  const location = useLocation();

  const hideHeaderRoutes = ["/forgot-password", "/reset-password"];

  return (
    <main className="overflow-hidden bg-primary text-[#404040]">
      <ToastContainer />
      {!hideHeaderRoutes.some((route) =>
        location.pathname.startsWith(route)
      ) && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Lindungi route yang butuh login - Ini juga di dalam ShopContextProvider */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-detail/:orderId" element={<OrderDetail />} />
          <Route path="/review/:orderId/:productId" element={<ReviewForm />} />
          <Route path="/my-reviews" element={<UserReviews />} />
        </Route>

        {/* Rute publik untuk melihat detail produk dan ulasannya */}
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* Rute catch-all untuk 404 - Harus PALING TERAKHIR */}
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </main>
  );
};

export default App;
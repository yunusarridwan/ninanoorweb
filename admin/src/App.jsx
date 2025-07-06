import React, { Component } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/theme-context";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode dari library

// Import components and pages
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminProtectedRoute from "./components/SuperAdminProtectedRoute";
import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/page";
import ProductPage from "./routes/products/page";
import AddProduct from "./routes/products/add";
import Login from "./layouts/login";
import UpdateProduct from "./routes/products/update";
import DetailProduct from "./routes/products/detail";
import UserPage from "./routes/customers/page";
import AdminPage from "./routes/admins/page";
import OrdersPage from "./routes/orders/page";
import AddAdmin from "./routes/admins/add";
import UpdateAdmin from "./routes/admins/update";
import CategoriesPage from "./routes/categories/page";
import AddCategories from "./routes/categories/add";
import UpdateCategories from "./routes/categories/update";
import OrderDetailPage from "./routes/orders/detail";
import InvoiceListPage from "./routes/invoices/page";
import AdminReviewManagement from "./routes/reviews/page";

class App extends Component {
  constructor(props) {
    super(props);
    // Inisialisasi token dari localStorage
    const initialToken = localStorage.getItem("token") || "";
    let initialAdminId = null;

    console.log("App.js - Constructor: Initial token from localStorage:", initialToken ? "HAS TOKEN" : "NO TOKEN");

    // Coba decode token saat inisialisasi state
    if (initialToken) {
      try {
        const decoded = jwtDecode(initialToken);
        initialAdminId = decoded.id || null; // Asumsikan 'id' adalah adminId di payload token
        console.log("App.js - Constructor: Decoded initial token. Admin ID:", initialAdminId);
      } catch (e) {
        console.error("App.js - Constructor: Failed to decode initial token from localStorage:", e);
        // Jika token tidak valid, hapus dari localStorage agar tidak mengganggu
        localStorage.removeItem("token");
        console.log("App.js - Constructor: Invalid token removed from localStorage.");
      }
    }

    this.state = {
      token: initialToken,
      adminId: initialAdminId,
    };

    console.log("App.js - Constructor: Initial state set. Token in state:", this.state.token ? "HAS TOKEN" : "NO TOKEN");

    this.setToken = this.setToken.bind(this);
    this.handleStorageChange = this.handleStorageChange.bind(this);
  }

  setToken(newToken) {
    console.log("App.js - setToken called with new token:", newToken ? "PROVIDED" : "EMPTY");
    let decodedToken = null;
    if (newToken) {
      try {
        decodedToken = jwtDecode(newToken);
        console.log("App.js - setToken: Successfully decoded new token.");
      } catch (e) {
        console.error("App.js - setToken: Failed to decode new token:", e);
        newToken = ""; // Jika token tidak valid, set ke string kosong
        console.log("App.js - setToken: Invalid new token, setting to empty.");
      }
    }

    this.setState({
      token: newToken,
      adminId: decodedToken ? decodedToken.id : null,
    }, () => {
      // Simpan token ke localStorage hanya jika valid
      if (this.state.token) {
        localStorage.setItem("token", this.state.token);
        console.log("App.js - setToken callback: Token SAVED to localStorage.");
      } else {
        localStorage.removeItem("token"); // Hapus jika token kosong/tidak valid
        console.log("App.js - setToken callback: Token REMOVED from localStorage.");
      }
      console.log("App.js - setToken callback: Current state token:", this.state.token ? "HAS TOKEN" : "NO TOKEN");
    });
  }

  handleStorageChange(event) {
    console.log("App.js - handleStorageChange triggered for key:", event.key);
    if (event.key === "token") {
      const newToken = event.newValue || "";
      let decodedToken = null;
      if (newToken) {
        try {
          decodedToken = jwtDecode(newToken);
        } catch (e) {
          console.error("App.js - handleStorageChange: Failed to decode token from storage change:", e);
          // Jika token tidak valid dari perubahan storage, perlakukan sebagai kosong
          decodedToken = null;
        }
      }

      // Hanya update state jika token benar-benar berubah
      if (newToken !== this.state.token) {
        console.log("App.js - handleStorageChange: Token changed, updating state.");
        this.setState({
          token: newToken,
          adminId: decodedToken ? decodedToken.id : null,
        });
      } else {
        console.log("App.js - handleStorageChange: Token not changed, no state update.");
      }
    }
  }

  componentDidMount() {
    console.log("App.js - componentDidMount: Adding storage event listener.");
    window.addEventListener("storage", this.handleStorageChange);
  }

  componentWillUnmount() {
    console.log("App.js - componentWillUnmount: Removing storage event listener.");
    window.removeEventListener("storage", this.handleStorageChange);
  }

  render() {
    const { token, adminId } = this.state; // Destructure adminId from state
    console.log("App.js - Render: Current token in state:", token ? "HAS TOKEN" : "NO TOKEN");
    console.log("App.js - Render: Admin ID in state:", adminId);

    const router = createBrowserRouter([
      {
        path: "/login",
        element: <Login setToken={this.setToken} />,
      },
      {
        path: "/",
        element: (
          <ProtectedRoute token={token}>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "products", element: <ProductPage /> },
          // Pass adminId as a prop to AddProduct
          { path: "products/add", element: <AddProduct adminId={adminId} /> },
          { path: "products/detail/:id", element: <DetailProduct /> },
          { path: "products/update/:id", element: <UpdateProduct /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "categories/add", element: <AddCategories /> },
          { path: "categories/update/:id", element: <UpdateCategories /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "orders/:orderId", element: <OrderDetailPage /> },
          { path: "reviews", element: <AdminReviewManagement /> },
          { path: "invoices", element: <InvoiceListPage /> },
          { path: "customers", element: <UserPage /> },
          {
            element: <SuperAdminProtectedRoute />,
            children: [
              { path: "admins", element: <AdminPage /> },
              { path: "admins/add", element: <AddAdmin /> },
              { path: "admins/update/:id", element: <UpdateAdmin /> }
            ],
          },
        ],
      },
    ]);

    return (
      <ThemeProvider storageKey="theme">
        <ToastContainer />
        <RouterProvider router={router} />
      </ThemeProvider>
    );
  }
}

export default App;

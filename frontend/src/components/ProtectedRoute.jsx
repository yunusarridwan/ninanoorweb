// src/components/ProtectedRoute.jsx
import { useContext } from 'react'; // Tambahkan React dan useContext
import { Outlet, Navigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContextDef'; // Pastikan path ini benar

const ProtectedRoute = () => {
    // Ambil token dari konteks, ini akan menjadi cara yang lebih konsisten
    const { token } = useContext(ShopContext); 

    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
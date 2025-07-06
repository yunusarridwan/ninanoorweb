// src/middleware/requireAdmin.js
const requireAdmin = (req, res, next) => {
  // Pastikan req.user sudah dilampirkan oleh middleware 'auth' sebelumnya
  if (!req.user || !req.user.role) {
    return res.status(401).json({ success: false, message: "Unauthorized: User data or role not found. Ensure authentication middleware is used first." });
  }
  
  // Periksa role user
  // Izinkan jika role adalah 'admin' atau 'superadmin'
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    next(); // Lanjutkan jika role sesuai
  } else {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
  }
};

export default requireAdmin;
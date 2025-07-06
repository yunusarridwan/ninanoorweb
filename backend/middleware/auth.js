// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';
import userModel from '../models/userModel.js'; // <-- Import juga User Model Anda

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user = null;

      // Logika untuk mencari user berdasarkan role dari token
      if (decoded.role === 'admin' || decoded.role === 'superadmin') {
        user = await adminModel.findById(decoded.id).select('-password');
      } else if (decoded.role === 'user') { // Asumsikan role 'user' ada di token user biasa
        user = await userModel.findById(decoded.id).select('-password');
      } else {
        return res.status(401).json({ success: false, message: 'Role tidak dikenali dalam token.' });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Tidak terotorisasi, pengguna tidak ditemukan atau role tidak cocok.' });
      }

      req.user = user; 
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Token kedaluwarsa. Silakan login ulang.' });
      }
      if (error.name === 'JsonWebTokenError') {
          if (error.message.includes('signature')) {
            return res.status(401).json({ success: false, message: 'Token tidak valid (signature mismatch). Periksa secret key.' });
          }
          return res.status(401).json({ success: false, message: 'Token tidak valid. Silakan login ulang.' });
      }
      return res.status(500).json({ success: false, message: "Kesalahan server saat otentikasi." });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Tidak terotorisasi, tidak ada token.' });
  }
};

export default auth;
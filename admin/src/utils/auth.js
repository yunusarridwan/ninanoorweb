// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

const decodeToken = (token) => {
  try {
    if (!token) {
      console.warn("Auth Util - decodeToken: No token provided.");
      return null;
    }
    const decoded = jwtDecode(token);
    console.log("Auth Util - decodeToken: Successfully decoded. Payload:", decoded);
    return decoded;
  } catch (e) {
    console.error("Auth Util - decodeToken: Failed to decode token:", e);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  console.log("Auth Util - isAuthenticated: Checking token from localStorage. Token exists:", !!token);
  const decoded = decodeToken(token);

  // Periksa keberadaan token dan apakah token belum kedaluwarsa
  const authenticated = !!token && decoded && (decoded.exp * 1000 > Date.now());

  console.log("Auth Util - isAuthenticated: Result:", authenticated);
  if (decoded) {
    console.log("Auth Util - Token expiration (ms):", decoded.exp * 1000);
    console.log("Auth Util - Current time (ms):", Date.now());
    console.log("Auth Util - Token expired:", decoded.exp * 1000 <= Date.now());
  }

  return authenticated;
};

export const isSuperAdmin = () => {
  const token = localStorage.getItem("token");
  console.log("Auth Util - isSuperAdmin: Checking token from localStorage. Token exists:", !!token);
  const decoded = decodeToken(token);

  // Asumsikan payload token memiliki properti 'role'
  const superAdmin = decoded && decoded.role === 'superadmin'; // Pastikan 'superadmin' sesuai dengan role di token Anda

  console.log("Auth Util - isSuperAdmin: Decoded Role:", decoded ? decoded.role : "N/A");
  console.log("Auth Util - isSuperAdmin: Result:", superAdmin);

  return superAdmin;
};
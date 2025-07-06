import React, { useEffect, useRef } from 'react'; // Import useRef
import { toast } from 'react-toastify';

const UnauthorizedPage = () => {
  const toastShownRef = useRef(false); // Buat ref untuk melacak apakah toast sudah ditampilkan

  useEffect(() => {
    // Hanya tampilkan toast jika belum pernah ditampilkan sebelumnya
    if (!toastShownRef.current) {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
      toastShownRef.current = true; // Setel menjadi true setelah toast ditampilkan
    }
  }, []); // [] memastikan efek ini hanya berjalan sekali saat mount (atau dua kali di Strict Mode, tapi ref akan mencegah double toast)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#f8f8f8',
      color: '#333',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ fontSize: '4em', margin: '0.2em', color: '#dc3545' }}>403</h1>
      <p style={{ fontSize: '1.5em', margin: '0.5em', fontWeight: 'bold' }}>Forbidden</p>
      <p style={{ fontSize: '1.2em', margin: '0.5em' }}>Anda tidak memiliki izin yang diperlukan untuk melihat halaman ini.</p>
      <p style={{ fontSize: '1em', color: '#666' }}>Silakan hubungi administrator jika Anda yakin ini adalah kesalahan.</p>
    </div>
  );
};

export default UnauthorizedPage;

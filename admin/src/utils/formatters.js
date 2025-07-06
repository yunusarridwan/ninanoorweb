export const formatRupiah = (angka) => {
    if (typeof angka !== 'number') return 'Rp 0,00';
    return `Rp ${angka.toLocaleString("id-ID")},00`;
};

export const formatTanggalIndonesia = (tanggal) => {
    if (!tanggal) return 'N/A';
    return new Date(tanggal).toLocaleDateString("id-ID", {
        weekday: "short", // 'short' untuk Singkat, 'long' untuk Lengkap
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
};

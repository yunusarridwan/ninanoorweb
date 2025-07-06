import React, { useState, useEffect } from 'react';
import api from "@/utils/api";
import { toast } from 'react-toastify';
import { formatRupiah } from '@/utils/formatters';
import { ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Package, Tag, Users, CreditCard, Home } from "lucide-react";
import { Breadcrumb } from "flowbite-react";
import { Footer } from "@/layouts/footer";

import { Clock, CheckCircle, PackageOpen, Truck, ListEnd, XCircle } from 'lucide-react';

const DashboardPage = () => {
    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        totalCategories: 0,
        recentSales: [],
        totalProducts: 0,
        totalCustomers: 0,
        totalSalesCount: 0,
        orderStatusCounts: {},
    });

    const STATUS_COLORS = {
        "Menunggu Pembayaran": { bg: "bg-yellow-500", text: "text-yellow-500", hex: "#F59E0B", icon: Clock },
        "Pembayaran Dikonfirmasi": { bg: "bg-green-500", text: "text-green-500", hex: "#10B981", icon: CheckCircle },
        "Diproses": { bg: "bg-blue-500", text: "text-blue-500", hex: "#3B82F6", icon: PackageOpen },
        "Dikirim": { bg: "bg-indigo-500", text: "text-indigo-500", hex: "#6366F1", icon: Truck },
        "Selesai": { bg: "bg-gray-500", text: "text-gray-500", hex: "#6B7280", icon: ListEnd },
        "Dibatalkan": { bg: "bg-red-500", text: "text-red-500", hex: "#EF4444", icon: XCircle },
    };

    const statusMap = {
        "all": { label: "Semua" },
        "Menunggu Pembayaran": { label: "Menunggu Pembayaran" },
        "Pembayaran Dikonfirmasi": { label: "Dikonfirmasi" },
        "Diproses": { label: "Diproses" },
        "Dikirim": { label: "Dikirim" },
        "Selesai": { label: "Selesai" },
        "Dibatalkan": { label: "Dibatalkan" },
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const categoriesRes = await api.get('/api/dashboard/total-categories', config);
                const summaryRes = await api.get('/api/dashboard/summary', config);
                const recentSalesRes = await api.get('/api/dashboard/order/recent-sales', config);
                const statusCountsRes = await api.get('/api/dashboard/order-status-counts', config);

                const recentSalesList = recentSalesRes.data?.recentSales || [];
                const fetchedStatusCounts = statusCountsRes.data?.statusCounts || {};

                setDashboardData({
                    totalCategories: categoriesRes.data?.totalCategories || 0,
                    recentSales: recentSalesList,
                    totalProducts: summaryRes.data?.totalProducts || 0,
                    totalCustomers: summaryRes.data?.totalCustomers || 0,
                    totalSalesCount: summaryRes.data?.totalSalesCount || 0,
                    orderStatusCounts: fetchedStatusCounts,
                });

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                if (err.response) {
                    setError(`Gagal memuat data dashboard: ${err.response.data.message || 'Kesalahan server'}`);
                    toast.error(`Gagal memuat data dashboard: ${err.response.data.message || 'Kesalahan server'}`);
                } else if (err.request) {
                    setError("Gagal memuat data dashboard: Tidak ada respons dari server.");
                    toast.error("Gagal memuat data dashboard: Tidak ada respons dari server.");
                } else {
                    setError(`Gagal memuat data dashboard: ${err.message}`);
                    toast.error(`Gagal memuat data dashboard: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const pieChartData = Object.keys(dashboardData.orderStatusCounts).map(status => ({
        name: statusMap[status]?.label || status,
        value: dashboardData.orderStatusCounts[status],
        color: STATUS_COLORS[status]?.hex || "#CCCCCC"
    })).filter(item => item.value > 0);

    const chartTextColor = theme === "light" ? "#334155" : "#E2E8F0";

    if (loading) {
        return (
            <div className={`flex justify-center items-center h-full min-h-[500px] ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <p>Memuat data dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex justify-center items-center h-full min-h-[500px] ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-500'}`}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={`p-6 font-sans min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            {/* Breadcrumb */}
            <Breadcrumb aria-label="Dashboard page breadcrumb" className="mb-4">
                <Breadcrumb.Item href="/" icon={Home}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
            {/* --- */}

            <h2 className="text-3xl font-extrabold mb-6 border-b-2 pb-2">Dashboard</h2>

            {/* Main Stats Cards (Total Products, Categories, Customers, Sales) */}
            {/* These cards have the icon on top, title below, then a large number below the title */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Total Products Card */}
                <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Header: Icon on top, Title below */}
                    <div className={`p-4 flex flex-col items-center text-center ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600 mb-2">
                            <Package size={26} />
                        </div>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Total Produk</p>
                    </div>
                    {/* Body: Large Number */}
                    <div className="p-4 relative flex justify-center items-center overflow-hidden h-24">
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} transition-colors z-10`}> {/* Adjusted to text-3xl font-bold */}
                            {dashboardData.totalProducts.toLocaleString('id-ID')}
                        </p>
                        {/* Subtle background element (angled lines) */}
                        <svg className={`absolute inset-0 w-full h-full ${theme === 'dark' ? 'text-gray-900' : 'text-slate-100'} opacity-70`} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                        {/* A very subtle overlay color for consistency */}
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-slate-100/30'} rounded-lg`}></div>
                    </div>
                </div>

                {/* Total Categories Card */}
                <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`p-4 flex flex-col items-center text-center ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600 mb-2">
                            <Tag size={26} />
                        </div>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Total Kategori</p>
                    </div>
                    <div className="p-4 relative flex justify-center items-center overflow-hidden h-24">
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} transition-colors z-10`}> {/* Adjusted to text-3xl font-bold */}
                            {dashboardData.totalCategories.toLocaleString('id-ID')}
                        </p>
                        <svg className={`absolute inset-0 w-full h-full ${theme === 'dark' ? 'text-gray-900' : 'text-slate-100'} opacity-70`} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-slate-100/30'} rounded-lg`}></div>
                    </div>
                </div>

                {/* Total Customers Card */}
                <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`p-4 flex flex-col items-center text-center ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600 mb-2">
                            <Users size={26} />
                        </div>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Total Pelanggan</p>
                    </div>
                    <div className="p-4 relative flex justify-center items-center overflow-hidden h-24">
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} transition-colors z-10`}> {/* Adjusted to text-3xl font-bold */}
                            {dashboardData.totalCustomers.toLocaleString('id-ID')}
                        </p>
                        <svg className={`absolute inset-0 w-full h-full ${theme === 'dark' ? 'text-gray-900' : 'text-slate-100'} opacity-70`} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-slate-100/30'} rounded-lg`}></div>
                    </div>
                </div>

                {/* Sales (Total Order Count) Card */}
                <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`p-4 flex flex-col items-center text-center ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600 mb-2">
                            <CreditCard size={26} />
                        </div>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Total Penjualan</p>
                    </div>
                    <div className="p-4 relative flex justify-center items-center overflow-hidden h-24">
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} transition-colors z-10`}> {/* Adjusted to text-3xl font-bold */}
                            {dashboardData.totalSalesCount.toLocaleString('id-ID')}
                        </p>
                        <svg className={`absolute inset-0 w-full h-full ${theme === 'dark' ? 'text-gray-900' : 'text-slate-100'} opacity-70`} viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-slate-100/30'} rounded-lg`}></div>
                    </div>
                </div>
            </div>

            {/* Order Status Counts Cards */}
            {/* These cards have the icon & title on the left, and count on the right */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-6">
                {Object.keys(STATUS_COLORS).filter(key => key !== 'all').map(status => {
                    const IconComponent = STATUS_COLORS[status]?.icon;
                    return (
                        <div key={status} className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            {/* Header: Icon and Title side-by-side */}
                            <div className={`p-4 flex items-center gap-x-3 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                                <div className={`flex-shrink-0 w-fit rounded-lg p-2 ${STATUS_COLORS[status]?.bg}/20 ${STATUS_COLORS[status]?.text} transition-colors`}>
                                    {IconComponent && <IconComponent size={26} />}
                                </div>
                                <p className={`flex-grow text-sm font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{statusMap[status]?.label || status}</p>
                            </div>
                            {/* Body: Large Number and "Jumlah" below it */}
                            <div className="p-4 relative flex flex-col items-center justify-center overflow-hidden h-24">
                                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'} transition-colors z-10`}> {/* Adjusted to text-3xl font-bold */}
                                    {dashboardData.orderStatusCounts[status]?.toLocaleString('id-ID') || 0}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                    Jumlah
                                </p>
                                <svg className={`absolute inset-0 w-full h-full ${theme === 'dark' ? 'text-gray-900' : 'text-slate-100'} opacity-70`} viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                                    <line x1="0" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                                    <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                                </svg>
                                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-slate-100/30'} rounded-lg`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pie Chart (Distribution of Order Status) and Recent Sales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                {/* Order Status Distribution Pie Chart */}
                <div className={`rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`p-4 flex items-center justify-between ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Distribusi Status Pesanan</p>
                    </div>
                    <div className="p-0 flex justify-center items-center h-[300px]">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => value.toLocaleString('id-ID')}
                                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', border: 'none' }}
                                        itemStyle={{ color: chartTextColor }}
                                    />
                                    <Legend
                                        wrapperStyle={{ color: chartTextColor }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada data status pesanan untuk ditampilkan.</p>
                        )}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className={`rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`p-4 flex items-center justify-between ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Penjualan Terbaru</p>
                    </div>
                    <div className="h-[300px] overflow-auto p-0">
                        {dashboardData.recentSales.length > 0 ? (
                            dashboardData.recentSales.map((sale, index) => (
                                <div
                                    key={sale.id || index}
                                    className={`flex items-center justify-between gap-x-4 py-2 pr-2 pl-4 ${theme === 'dark' ? 'border-b border-gray-700 last:border-b-0' : 'border-b border-gray-100 last:border-b-0'}`}
                                >
                                    <div className="flex items-center gap-x-4">
                                        <img
                                            src={sale.image || 'https://via.placeholder.com/40'}
                                            alt={sale.name}
                                            className="size-10 flex-shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                        <div className="flex flex-col">
                                            <p className={`font-medium ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{sale.name}</p>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{sale.email}</p>
                                        </div>
                                    </div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{formatRupiah(sale.total)}</p>
                                </div>
                            ))
                        ) : (
                            <p className={`px-4 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada penjualan terbaru.</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPage;
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";

import { Sidebar } from "@/layouts/sidebar";
import { Header } from "@/layouts/header";
import { cn } from "@/utils/cn";

import { Modal } from "flowbite-react";

const Layout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);
    const [openModal, setOpenModal] = useState(false);

    const sidebarRef = useRef(null);

    const handleLogoutConfirm = () => {
        localStorage.removeItem("token");
        
        window.location.href = "/login";
    };

    const handleLogoutClick = () => {
        setOpenModal(true);
    };

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                    !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                )}
            />
            <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
                onLogout={handleLogoutClick} // Trigger modal instead of direct logout
            />
            <div className={cn("transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden p-6">
                    <Outlet />
                </div>
            </div>

            {/* Modal konfirmasi logout */}
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Konfirmasi Logout</Modal.Header>
                <Modal.Body>
                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        Apakah Anda yakin ingin keluar?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={handleLogoutConfirm}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
                    >
                        Ya, keluar
                    </button>
                    <button
                        onClick={() => setOpenModal(false)}
                        className="ml-2 rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Batal
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Layout;

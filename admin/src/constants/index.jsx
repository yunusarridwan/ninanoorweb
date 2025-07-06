import { ThumbsUp, Home, NotebookText, Package, ShoppingCart, Users } from "lucide-react";

export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/",
            },
        ],
    },
    {
        title: "Invoice",
        links: [
            {
                label: "Invoice",
                icon: NotebookText,
                path: "/invoices",
            },
        ],
    },
    {
        title: "Admin",
        links: [
            {
                label: "Admin",
                icon: Users,
                path: "/admins",
            },
        ],
    },
    {
        title: "Pelanggan",
        links: [
            {
                label: "Pelanggan",
                icon: Users,
                path: "/customers",
            },
        ],
    },
    {
        title: "Produk",
        links: [
            {
                label: "Produk",
                icon: Package,
                path: "/products", // Changed from /product to /products for consistency
            },
            {
                label: "Kategori",
                icon: Package, // You'll need to import 'Tag' icon from your icon library (e.g., 'lucide-react')
                path: "/categories",
            },
        ],
    },
    {
        title: "Orders",
        links: [
            {
                label: "Pesanan",
                icon: ShoppingCart,
                path: "/orders",
            },
        ],
    },
    {
        title: "Ulasan",
        links: [
            {
                label: "Ulasan",
                icon: ThumbsUp,
                path: "/reviews",
            },
        ],
    },
];
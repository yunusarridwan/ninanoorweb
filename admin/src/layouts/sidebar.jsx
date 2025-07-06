import { forwardRef, useState } from "react";
import { NavLink } from "react-router-dom"; // Removed useLocation if not used
import PropTypes from "prop-types";

import { navbarLinks } from "@/constants";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

import { cn } from "@/utils/cn";
import { ChevronDown, Home, Package, ShoppingCart, Tag, Users } from "lucide-react";

export const Sidebar = forwardRef(({ collapsed, onLogout }, ref) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const handleDropdownToggle = (title) => {
        setOpenDropdown(openDropdown === title ? null : title);
    };

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 transition-all",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            <div className="flex gap-x-3 p-3">
                <img src={logoLight} alt="Ninanoor" className="dark:hidden" />
                {/* Corrected: Removed duplicate alt attribute */}
                <img src={logoDark} alt="Ninanoor" className="hidden dark:block" />
                {!collapsed && (
                    <p className="text-lg font-medium text-slate-900 transition-colors dark:text-slate-50">
                        Ninanoor
                    </p>
                )}
            </div>

            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {navbarLinks.map((navbarLink) => (
                    <div key={navbarLink.title}>
                        {navbarLink.links.length > 1 ? (
                            // Render as dropdown
                            <div className={cn("sidebar-group", collapsed && "md:items-center")}>
                                <button
                                    onClick={() => handleDropdownToggle(navbarLink.title)}
                                    className={cn(
                                        "sidebar-item flex justify-between items-center w-full",
                                        collapsed && "md:w-[45px]",
                                        openDropdown === navbarLink.title && "bg-slate-100 dark:bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-x-3">
                                        {/* Corrected: Define MainIcon here for the dropdown button */}
                                        {(() => {
                                            const MainIcon = navbarLink.links[0].icon;
                                            return MainIcon && <MainIcon size={22} className="flex-shrink-0" />;
                                        })()}
                                        {!collapsed && <p className="whitespace-nowrap">{navbarLink.title}</p>}
                                    </div>
                                    {!collapsed && (
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                "transition-transform",
                                                openDropdown === navbarLink.title && "rotate-180"
                                            )}
                                        />
                                    )}
                                </button>
                                {openDropdown === navbarLink.title && (
                                    <div className={cn("pl-4 mt-1", collapsed && "md:pl-0 md:text-center")}>
                                        {navbarLink.links.map((link) => {
                                            const LinkIcon = link.icon; // Assign the icon component to a capitalized variable
                                            return (
                                                <NavLink
                                                    key={link.label}
                                                    to={link.path}
                                                    className={({ isActive }) =>
                                                        cn(
                                                            "sidebar-item text-sm py-1.5",
                                                            collapsed && "md:w-[45px]",
                                                            isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-600" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        )
                                                    }
                                                >
                                                    {LinkIcon && <LinkIcon size={18} className="flex-shrink-0" />}
                                                    {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Render as a single link
                            <nav key={navbarLink.title} className={cn("sidebar-group", collapsed && "md:items-center")}>
                                {navbarLink.links.map((link) => {
                                    const LinkIcon = link.icon; // Assign the icon component to a capitalized variable
                                    return (
                                        <NavLink
                                            key={link.label}
                                            to={link.path}
                                            className={({ isActive }) =>
                                                cn(
                                                    "sidebar-item",
                                                    collapsed && "md:w-[45px]",
                                                    isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : ""
                                                )
                                            }
                                        >
                                            {LinkIcon && <LinkIcon size={22} className="flex-shrink-0" />}
                                            {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                ))}

                {/* Logout Button */}
                <div className={cn("mt-auto", collapsed && "flex justify-center")}>
                    <button
                        onClick={onLogout}
                        className="w-full rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
                    >
                        {!collapsed ? "Logout" : "⎋"}
                    </button>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
    onLogout: PropTypes.func,
};
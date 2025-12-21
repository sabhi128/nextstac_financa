import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Truck, Warehouse, History } from 'lucide-react';
import { clsx } from 'clsx';

const InventoryHeader = () => {
    const navItems = [
        { label: 'Overview', path: '/inventory', icon: Package, exact: true },
        { label: 'Products', path: '/inventory/products', icon: Package },
        { label: 'Stock', path: '/inventory/stock', icon: History },
        { label: 'Warehouses', path: '/inventory/warehouses', icon: Warehouse },
        { label: 'Vendors', path: '/inventory/vendors', icon: Truck },
    ];

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 font-[Inter]">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-teal-200">
                            I
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                                Inventory
                            </h1>
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                Logistics
                            </span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                    <nav className="hidden sm:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
            {/* Mobile Nav */}
            <div className="sm:hidden overflow-x-auto pb-3 px-4 flex gap-2 no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => clsx(
                            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            isActive
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200"
                        )}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default InventoryHeader;

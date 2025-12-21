import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mockDataService } from '../../../services/mockDataService';
import {
    ShoppingCart,
    Package,
    Users,
    DollarSign,
    ArrowUpRight,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../../components/ui/animations';
import { useToast } from '../../../context/ToastContext';

export default function EcommerceDashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: products } = useQuery({ queryKey: ['products'], queryFn: mockDataService.getProducts });
    const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: mockDataService.getOrders });
    const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: mockDataService.getCustomers });

    const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock < p.minStock) || [];

    const handleDownloadReport = () => {
        // Simulate download
        const element = document.createElement("a");
        const file = new Blob(["Ecommerce Report 2024\n\nRevenue: $" + totalRevenue], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "report_2024.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);

        showToast("Report downloaded successfully", "success");
    };

    const handleConnectStore = () => {
        showToast("Redirecting to Store Connection Wizard...", "info");
        // In a real app: navigate('/settings/integrations');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">E-commerce Overview</h1>
                    <p className="text-slate-500 mt-1">Store performance and inventory status</p>
                </div>
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <button
                        onClick={handleDownloadReport}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                        Download Report
                    </button>
                    <button
                        onClick={handleConnectStore}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Connect Store
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <motion.div variants={cardVariants} custom={0} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                +12.5% <ArrowUpRight className="w-3 h-3 ml-1" />
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalRevenue.toLocaleString()}</h3>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} custom={1} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalOrders}</h3>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} custom={2} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Active Customers</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{customers?.length || 0}</h3>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} custom={3} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Package className="w-6 h-6" />
                            </div>
                            {lowStockProducts.length > 0 && (
                                <span className="flex items-center text-red-600 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                    {lowStockProducts.length} Low Stock
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Total Products</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{products?.length || 0}</h3>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Recent Orders */}
                <motion.div variants={cardVariants} custom={4} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                        <button
                            onClick={() => navigate('/sales/orders')}
                            className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1 group"
                        >
                            View All <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {orders?.slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 group cursor-pointer" onClick={() => navigate('/sales/orders')}>
                                <div>
                                    <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{order.customerName}</p>
                                    <p className="text-xs text-slate-500">{order.orderNumber} • {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">${order.amount.toLocaleString()}</p>
                                    <span className={`text-xs font-medium ${order.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Low Stock Alert */}
                <motion.div variants={cardVariants} custom={5} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Low Stock Alerts</h2>
                        <button
                            onClick={() => navigate('/inventory/products')}
                            className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1 group"
                        >
                            Manage Inventory <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    {lowStockProducts.length > 0 ? (
                        <div className="space-y-3">
                            {lowStockProducts.map(product => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer" onClick={() => navigate('/inventory/products')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-red-100">
                                            <Package className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{product.stock} Left</p>
                                        <p className="text-xs text-red-400">Min: {product.minStock}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p>All stock levels are healthy</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div >
    );
}

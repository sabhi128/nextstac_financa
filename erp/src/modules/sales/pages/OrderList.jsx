import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    ShoppingCart,
    Search,
    Filter,
    Package,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    ChevronDown,
    X
} from 'lucide-react';

import ConfirmationModal from '../../../components/ConfirmationModal';
import OrderModal from '../components/OrderModal';

export default function OrderList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, id: null });
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All'); // All, Processing, Shipped, Delivered, Cancelled
    const [paymentFilter, setPaymentFilter] = useState('All'); // All, Paid, Pending, Overdue

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: mockDataService.getOrders,
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteOrder(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            setConfirmationModal({ isOpen: false, id: null });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateOrderStatus(id, status)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['orders'])
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateOrderPaymentStatus(id, status)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['orders'])
    });

    const addOrderMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addOrder(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            setIsModalOpen(false);
        }
    });

    const handleStatusClick = (order) => {
        const statusOrder = ['Processing', 'Shipped', 'Delivered'];
        const currentIndex = statusOrder.indexOf(order.status);

        if (currentIndex !== -1) {
            const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
            updateStatusMutation.mutate({ id: order.id, status: nextStatus });
        } else if (order.status === 'Cancelled') {
            updateStatusMutation.mutate({ id: order.id, status: 'Processing' });
        }
    };

    const filteredOrders = orders?.filter(o => {
        const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'Cancelled': return <XCircle className="w-4 h-4 text-rose-500" />;
            case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    const getPaymentBadgeColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-700';
            case 'Overdue': return 'bg-rose-100 text-rose-700';
            default: return 'bg-amber-50 text-amber-700';
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => addOrderMutation.mutate(data)}
            />

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ isOpen: false, id: null })}
                onConfirm={() => deleteOrderMutation.mutate(confirmationModal.id)}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action works properly and cannot be undone."
                confirmText="Delete Order"
                variant="danger"
            />

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Orders</h2>
                        <p className="text-slate-500 text-sm">Manage sales orders and fulfillment</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Order
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 relative z-20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full pl-10 pr-4 py-2.5 input-premium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`w-full md:w-auto px-4 py-2 border rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Filter Dropdown */}
                        {showFilters && (
                            <div className="absolute right-0 top-full mt-2 w-full md:w-64 bg-white shadow-xl rounded-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By</h3>
                                    <button onClick={() => { setStatusFilter('All'); setPaymentFilter('All'); }} className="text-[10px] text-indigo-600 hover:underline">Reset</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 block">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 block">Payment</label>
                                        <select
                                            value={paymentFilter}
                                            onChange={(e) => setPaymentFilter(e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="All">All Payments</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-premium">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th className="text-right">Amount</th>
                                    <th className="text-center">Payment</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders?.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-mono font-medium text-indigo-600">{order.orderNumber}</td>
                                        <td className="font-medium text-slate-900">{order.customer}</td>
                                        <td className="text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="text-right font-bold text-slate-900">${order.amount.toLocaleString()}</td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => updatePaymentStatusMutation.mutate({
                                                    id: order.id,
                                                    status: order.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                                                })}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity ${getPaymentBadgeColor(order.paymentStatus)}`}
                                            >
                                                {order.paymentStatus}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleStatusClick(order)}
                                                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
                                                title="Click to update status"
                                            >
                                                {getStatusIcon(order.status)}
                                                <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{order.status}</span>
                                            </button>
                                        </td>
                                        <td className="text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => setConfirmationModal({ isOpen: true, id: order.id })}
                                                className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredOrders?.map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.orderNumber}</span>
                                    <h3 className="font-bold text-slate-900 mt-1">{order.customer}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900">${order.amount.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updatePaymentStatusMutation.mutate({
                                            id: order.id,
                                            status: order.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                                        })}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide hover:opacity-80 transition-opacity ${getPaymentBadgeColor(order.paymentStatus)}`}
                                    >
                                        {order.paymentStatus}
                                    </button>
                                    <button
                                        onClick={() => handleStatusClick(order)}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition-colors cursor-pointer"
                                    >
                                        {getStatusIcon(order.status)}
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{order.status}</span>
                                    </button>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setConfirmationModal({ isOpen: true, id: order.id })}
                                        className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

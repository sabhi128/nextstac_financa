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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";



export default function OrderList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, id: null });
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

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Cancelled': return 'destructive';
            case 'Shipped': return 'info'; // Assuming 'info' variant exists or map to 'default'/'secondary'
            default: return 'warning';
        }
    };

    const getPaymentBadgeVariant = (status) => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Overdue': return 'destructive';
            default: return 'warning';
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;

    return (
        <div className="space-y-6">
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage sales orders and fulfillment.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    New Order
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search orders..."
                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="w-[140px] flex-shrink-0">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Statuses</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-[140px] flex-shrink-0">
                                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <DollarSignIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="Payment" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Payments</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders?.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-mono font-medium text-indigo-600">
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{order.customer}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(order.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-slate-900">
                                                ${order.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={getPaymentBadgeVariant(order.paymentStatus)}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => updatePaymentStatusMutation.mutate({
                                                        id: order.id,
                                                        status: order.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                                                    })}
                                                >
                                                    {order.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1.5 cursor-pointer hover:bg-slate-100 transition-colors pr-2.5"
                                                    onClick={() => handleStatusClick(order)}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' :
                                                        order.status === 'Cancelled' ? 'bg-rose-500' :
                                                            order.status === 'Shipped' ? 'bg-blue-500' :
                                                                'bg-amber-500'
                                                        }`} />
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setConfirmationModal({ isOpen: true, id: order.id })}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No orders found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredOrders?.map((order) => (
                            <div key={order.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.orderNumber}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mt-1">{order.customer}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">${order.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <Badge
                                            variant={getPaymentBadgeVariant(order.paymentStatus)}
                                            className="cursor-pointer"
                                            onClick={() => updatePaymentStatusMutation.mutate({
                                                id: order.id,
                                                status: order.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                                            })}
                                        >
                                            {order.paymentStatus}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="gap-1 cursor-pointer"
                                            onClick={() => handleStatusClick(order)}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' :
                                                order.status === 'Cancelled' ? 'bg-rose-500' :
                                                    order.status === 'Shipped' ? 'bg-blue-500' :
                                                        'bg-amber-500'
                                                }`} />
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setConfirmationModal({ isOpen: true, id: order.id })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Icon helper since DollarSign is used for payment filter
const DollarSignIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
)

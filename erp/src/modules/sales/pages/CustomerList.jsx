import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    MoreHorizontal,
    Trash2
} from 'lucide-react';


import CustomerFormModal from '../components/CustomerFormModal';
import CustomerProfileModal from '../components/CustomerProfileModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function CustomerList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [profileCustomer, setProfileCustomer] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: mockDataService.getCustomers,
    });

    const addCustomerMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addCustomer(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
            setIsAddModalOpen(false);
            setEditingCustomer(null);
        }
    });

    const updateCustomerMutation = useMutation({
        mutationFn: ({ id, data }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateCustomer(id, data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
            setIsAddModalOpen(false);
            setEditingCustomer(null);
            setProfileCustomer(null); // Close profile as data changed
        }
    });

    const deleteCustomerMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteCustomer(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
        }
    });

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setProfileCustomer(null); // Close profile modal
        setIsAddModalOpen(true);  // Open form modal
    };

    const handleFormSubmit = (data) => {
        if (editingCustomer) {
            updateCustomerMutation.mutate({ id: editingCustomer.id, data });
        } else {
            addCustomerMutation.mutate(data);
        }
    };

    const filteredCustomers = customers?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading customers...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <CustomerFormModal
                isOpen={isAddModalOpen}
                initialData={editingCustomer}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                }}
                onSubmit={handleFormSubmit}
            />

            <CustomerProfileModal
                isOpen={!!profileCustomer}
                customer={profileCustomer}
                onClose={() => setProfileCustomer(null)}
                onEdit={handleEditCustomer}
            />

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Customers</h2>
                        <p className="text-slate-500 text-sm">Manage client relationships</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCustomer(null);
                            setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Customer
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                    <Search className="absolute left-7 top-6.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-4 py-2.5 input-premium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers?.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{customer.name}</h3>
                                        <p className="text-xs text-slate-500">{customer.company}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: customer.id, name: customer.name })}
                                        className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Customer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{customer.phone}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                <div>
                                    <span className="text-slate-500">Orders: </span>
                                    <span className="font-semibold text-slate-900">{customer.totalOrders}</span>
                                </div>
                                <button
                                    onClick={() => setProfileCustomer(customer)}
                                    className="text-indigo-600 font-semibold hover:text-indigo-700">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteCustomerMutation.mutate(deleteModal.id)}
                title="Delete Customer?"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete Customer"
                cancelText="Cancel"
                variant="danger"
            />
        </div >
    );
}

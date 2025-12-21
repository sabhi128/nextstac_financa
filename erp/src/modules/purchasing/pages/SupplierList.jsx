import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Building2,
    Search,
    Filter,
    MoreHorizontal,
    Star,
    Phone,
    Mail,
    Plus,
    Trash2,
    Edit2,
    MapPin
} from 'lucide-react';
import SupplierFormModal from '../components/SupplierFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function SupplierList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['vendors'],
        queryFn: mockDataService.getVendors,
    });

    const addMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addVendor(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setIsFormOpen(false);
            setEditingSupplier(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateVendor(id, data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setIsFormOpen(false);
            setEditingSupplier(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteVendor(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setDeleteConfirm({ isOpen: false, id: null });
        }
    });

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ isOpen: true, id });
    };

    const handleFormSubmit = (data) => {
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, data });
        } else {
            addMutation.mutate(data);
        }
    };

    const toggleStatus = (supplier) => {
        const newStatus = supplier.status === 'Active' ? 'Inactive' : 'Active';
        updateMutation.mutate({
            id: supplier.id,
            data: { status: newStatus }
        });
    };

    const filteredSuppliers = suppliers?.filter(s =>
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading suppliers...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <SupplierFormModal
                isOpen={isFormOpen}
                initialData={editingSupplier}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingSupplier(null);
                }}
                onSubmit={handleFormSubmit}
            />

            <ConfirmationModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
                confirmText="Delete Supplier"
                variant="danger"
            />

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Suppliers</h2>
                        <p className="text-slate-500 text-sm">Manage vendor relationships and procurement</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setIsFormOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Supplier
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                    <Search className="absolute left-7 top-6.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers?.map(supplier => (
                        <div key={supplier.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(supplier)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{supplier.companyName}</h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                            <span>{supplier.rating}/5 Reliability</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium">{supplier.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{supplier.address}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => toggleStatus(supplier)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${supplier.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {supplier.status}
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredSuppliers?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No suppliers found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function User({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}

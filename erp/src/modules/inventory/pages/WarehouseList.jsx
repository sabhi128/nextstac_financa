import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Warehouse,
    Plus,
    Search,
    MapPin,
    Package,
    MoreVertical,
    Trash2
} from 'lucide-react';
import ConfirmationModal from '../../../components/ConfirmationModal';


export default function WarehouseList() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: ''
    });

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: mockDataService.getWarehouses,
    });

    const addWarehouseMutation = useMutation({
        mutationFn: (newWarehouse) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.addWarehouse(newWarehouse));
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['warehouses']);
            setIsModalOpen(false);
            setFormData({ name: '', location: '', capacity: '' });
        }
    });

    const deleteWarehouseMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteWarehouse(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['warehouses']);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateWarehouse(id, { status }));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['warehouses']);
        }
    });

    const handleStatusToggle = (wh) => {
        const newStatus = wh.status === 'Active' ? 'Inactive' : 'Active';
        updateStatusMutation.mutate({ id: wh.id, status: newStatus });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addWarehouseMutation.mutate({
            ...formData,
            capacity: formData.capacity + ' units'
        });
    };

    const filteredWarehouses = warehouses?.filter(wh =>
        wh.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading warehouses...</div>;

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
                        <p className="text-slate-500 text-sm">Manage inventory storage locations</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Warehouse
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search warehouses..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredWarehouses?.map((wh) => (
                        <div key={wh.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                                        <Warehouse className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: wh.id, name: wh.name })}
                                        className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Warehouse"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">{wh.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {wh.location}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Package className="w-4 h-4 text-slate-400" />
                                        <span>Capacity: <b>{wh.capacity}</b></span>
                                    </div>
                                    <button
                                        onClick={() => handleStatusToggle(wh)}
                                        className={`px-2 py-1 text-xs font-bold rounded-full transition-all active:scale-95 border ${wh.status === 'Active'
                                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                            }`}
                                    >
                                        {wh.status}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900">Add New Warehouse</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Warehouse Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Central Hub"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. 500 Industrial Ave"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                        placeholder="e.g. 10000"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addWarehouseMutation.isPending}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {addWarehouseMutation.isPending ? 'Creating...' : 'Create Warehouse'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteWarehouseMutation.mutate(deleteModal.id)}
                title="Delete Warehouse?"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete Warehouse"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    MapPin,
    Plus,
    Search,
    Phone,
    User,
    MoreVertical,
    Trash2
} from 'lucide-react';


export default function BranchList() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        manager: '',
        address: '',
        phone: ''
    });

    const { data: branches, isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: mockDataService.getBranches,
    });

    const addBranchMutation = useMutation({
        mutationFn: (newBranch) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.addBranch(newBranch));
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            setIsModalOpen(false);
            setFormData({ name: '', manager: '', address: '', phone: '' });
        }
    });

    const deleteBranchMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteBranch(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateBranch(id, { status }));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
        }
    });

    const handleStatusToggle = (branch) => {
        const newStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
        updateStatusMutation.mutate({ id: branch.id, status: newStatus });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addBranchMutation.mutate(formData);
    };

    const filteredBranches = branches?.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading branches...</div>;

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
                        <p className="text-slate-500 text-sm">Manage company locations and offices</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Branch
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBranches?.map((branch) => (
                        <div key={branch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this branch?')) {
                                                deleteBranchMutation.mutate(branch.id);
                                            }
                                        }}
                                        className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Branch"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">{branch.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{branch.address}</p>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>Manager: <span className="font-medium text-slate-900">{branch.manager}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{branch.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-sm">
                                <span className="text-slate-500">Status</span>
                                <button
                                    onClick={() => handleStatusToggle(branch)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 ${branch.status === 'Active'
                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                        }`}
                                >
                                    {branch.status}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900">Add New Branch</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Branch Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Downtown Office"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="e.g. 123 Main St, City"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Manager Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.manager}
                                        onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Phone</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="e.g. (555) 123-4567"
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
                                        disabled={addBranchMutation.isPending}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {addBranchMutation.isPending ? 'Creating...' : 'Create Branch'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

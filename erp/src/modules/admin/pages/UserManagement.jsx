import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Users,
    Plus,
    Trash2,
    Shield,
    AlertTriangle,
    CheckCircle,
    DollarSign
} from 'lucide-react';

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'ecommerce_admin'
    });
    const [error, setError] = useState('');

    // Fetch Admins
    const { data: admins, isLoading: isLoadingAdmins } = useQuery({
        queryKey: ['admins'],
        queryFn: mockDataService.getAdmins,
    });

    // Fetch Base Pool Config
    const { data: config } = useQuery({
        queryKey: ['compensation-config'],
        queryFn: mockDataService.getCompensationConfig,
    });

    const basePool = config?.basePool || 0;

    const addAdminMutation = useMutation({
        mutationFn: (newAdmin) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const result = mockDataService.addAdmin(newAdmin);
                    if (result.success) resolve(result.data);
                    else reject(result.error);
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'ecommerce_admin' });
            setError('');
        },
        onError: (err) => {
            setError(err);
        }
    });

    const updateAdminMutation = useMutation({
        mutationFn: ({ id, updates }) => {
            return new Promise(resolve => {
                mockDataService.updateAdmin(id, updates);
                resolve();
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
        }
    });

    const updateConfigMutation = useMutation({
        mutationFn: (updates) => {
            return new Promise(resolve => {
                mockDataService.updateCompensationConfig(updates);
                resolve();
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['compensation-config']);
        }
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    mockDataService.deleteAdmin(id);
                    resolve();
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
        }
    });

    const handleUpdateShare = (id, percentage) => {
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        updateAdminMutation.mutate({ id, updates: { sharePercentage: percentage } });
    };

    const handleUpdateBasePool = (amount) => {
        updateConfigMutation.mutate({ basePool: amount });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addAdminMutation.mutate(formData);
    };

    if (isLoadingAdmins) return <div className="p-8 text-center">Loading users...</div>;

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">Super Admin</span>;
            case 'ecommerce_admin':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">E-commerce Admin</span>;
            case 'dev_admin':
                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Dev Admin</span>;
            default:
                return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">User</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
                    <p className="text-slate-500 text-sm">Manage system administrators and their roles</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add New Admin
                </button>
            </div>

            {/* Compensation & Limits Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">E-commerce Admins</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {admins?.filter(a => a.role === 'ecommerce_admin').length} / 5
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Dev Admins</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {admins?.filter(a => a.role === 'dev_admin').length} / 5
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compensation Base Pool */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-5 rounded-xl text-white shadow-lg lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-indigo-300" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">Total Base Pool</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">$</span>
                        <input
                            type="number"
                            value={basePool}
                            onChange={(e) => handleUpdateBasePool(parseFloat(e.target.value) || 0)}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-2xl font-bold text-white outline-none focus:bg-white/20 w-full"
                        />
                    </div>
                    <p className="text-xs text-indigo-300 mt-2">Shared Monthly Allocation</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Profit Share (%)</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Est. Salary</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {admins?.map((admin) => (
                                <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{admin.name}</p>
                                                <p className="text-xs text-slate-500">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(admin.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {admin.role !== 'super_admin' ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={admin.sharePercentage || 0}
                                                    onChange={(e) => handleUpdateShare(admin.id, parseFloat(e.target.value))}
                                                    className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none"
                                                />
                                                <span className="text-slate-500">%</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                        {admin.role !== 'super_admin' ? (
                                            `$${((basePool * (admin.sharePercentage || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Excluded</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                            <CheckCircle className="w-3 h-3" />
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {admin.role !== 'super_admin' && (
                                            <button
                                                onClick={() => deleteAdminMutation.mutate(admin.id)}
                                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Remove Admin"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Add New Admin</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="ecommerce_admin">E-commerce Admin</option>
                                    <option value="dev_admin">Dev Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setError(''); }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addAdminMutation.isPending}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                                >
                                    {addAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

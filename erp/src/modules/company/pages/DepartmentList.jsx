import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Building2,
    Plus,
    Search,
    Users,
    DollarSign,
    MoreVertical,
    Trash2
} from 'lucide-react';


export default function DepartmentList() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        head: '',
        budget: ''
    });

    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: mockDataService.getDepartments,
    });

    const addDepartmentMutation = useMutation({
        mutationFn: (newDept) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.addDepartment(newDept));
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            setIsModalOpen(false);
            setFormData({ name: '', head: '', budget: '' });
        }
    });

    const deleteDepartmentMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteDepartment(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addDepartmentMutation.mutate({
            ...formData,
            budget: parseFloat(formData.budget) || 0
        });
    };

    const filteredDepartments = departments?.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.head.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading departments...</div>;

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
                        <p className="text-slate-500 text-sm">Manage organizational structure and budgets</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Department
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments?.map((dept) => (
                        <div key={dept.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this department?')) {
                                            deleteDepartmentMutation.mutate(dept.id);
                                        }
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete Department"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{dept.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">Head: {dept.head}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        Employees
                                    </span>
                                    <span className="font-semibold text-slate-900">{dept.employeeCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <DollarSign className="w-4 h-4 text-slate-400" />
                                        Budget
                                    </span>
                                    <span className="font-semibold text-slate-900">${dept.budget.toLocaleString()}</span>
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
                                <h2 className="text-lg font-bold text-slate-900">Add New Department</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Department Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Marketing"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Department Head</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.head}
                                        onChange={e => setFormData({ ...formData, head: e.target.value })}
                                        placeholder="e.g. Jane Smith"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Annual Budget</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                        placeholder="e.g. 500000"
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
                                        disabled={addDepartmentMutation.isPending}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {addDepartmentMutation.isPending ? 'Creating...' : 'Create Department'}
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

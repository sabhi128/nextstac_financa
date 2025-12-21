import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import EmployeeForm from '../components/EmployeeForm';
import {
    Users,
    Plus,
    Search,
    Filter,
    Mail,
    Trash2,
    MoreHorizontal,
    UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../../components/ui/animations';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { useToast } from '../../../context/ToastContext';

export default function EmployeeList() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: mockDataService.getEmployees,
    });

    const addEmployeeMutation = useMutation({
        mutationFn: (newEmployee) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockDataService.addEmployee(newEmployee)), 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            setIsFormOpen(false);
            showToast('Employee added successfully', 'success');
        }
    });

    const deleteEmployeeMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockDataService.deleteEmployee(id)), 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            showToast('Employee deleted successfully', 'success');
            setDeleteModal({ ...deleteModal, isOpen: false });
        }
    });

    const filteredEmployees = employees?.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading employees...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error loading data</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Employees</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage your team members and their roles</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm shadow-indigo-200 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add Employee
                    </button>
                </div>

                {/* Filters & Search - Responsive Stack */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-10 pr-4 py-2.5 input-premium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg flex items-center justify-center gap-2 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Grid View - Responsive Columns */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                    {filteredEmployees?.map((employee, i) => (
                        <motion.div
                            key={employee.id}
                            variants={cardVariants}
                            custom={i}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 p-5 group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={employee.avatar}
                                        alt={employee.firstName}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-50"
                                    />
                                    <div>
                                        <h3 className="font-bold text-slate-900 line-clamp-1">{employee.firstName} {employee.lastName}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{employee.position}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: employee.id, name: `${employee.firstName} ${employee.lastName}` })}
                                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{employee.department}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    employee.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}>
                                    {employee.status}
                                </span>
                                <Link
                                    to={`/hr/employees/${employee.id}`}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    View Profile →
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <EmployeeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={(data) => addEmployeeMutation.mutate(data)}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteEmployeeMutation.mutate(deleteModal.id)}
                title="Delete Employee?"
                message={`Are you sure you want to remove ${deleteModal.name}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

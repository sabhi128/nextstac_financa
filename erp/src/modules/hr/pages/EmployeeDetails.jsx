import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import EmployeeForm from '../components/EmployeeForm';
import SalaryHistoryChart from '../components/SalaryHistoryChart';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    DollarSign,
    User,
    Edit
} from 'lucide-react';


export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: mockDataService.getEmployees,
    });

    const updateEmployeeMutation = useMutation({
        mutationFn: (data) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockDataService.updateEmployee(id, data)), 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            setIsEditOpen(false);
        }
    });

    const employee = employees?.find(e => e.id === id);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">Loading profile...</div>;
    if (!employee) return <div className="min-h-screen flex items-center justify-center text-slate-500">Employee not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">

            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/hr/employees')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 mt-4">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                    <div className="px-6 md:px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-4">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
                                <img
                                    src={employee.avatar}
                                    alt={employee.firstName}
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg bg-white object-cover"
                                />
                                <div className="mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h1>
                                    <p className="text-slate-500 font-medium text-lg">{employee.position}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${employee.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                {employee.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-slate-100 pt-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-opacity-50">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{employee.phone || 'No phone provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{employee.address || 'No address provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-opacity-50">Employment Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{employee.department}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600 group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">${parseInt(employee.salary).toLocaleString()}/yr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-opacity-50 mb-6">Salary History</h3>

                            <SalaryHistoryChart employeeId={id} />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">Good</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Attendance Rate</p>
                        <h4 className="text-2xl font-bold text-slate-900 mt-1">98.5%</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <User className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Leave Balance</p>
                        <h4 className="text-2xl font-bold text-slate-900 mt-1">12 Days</h4>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 border-dashed flex items-center justify-center text-slate-400 font-medium text-sm">
                        More metrics coming soon
                    </div>
                </div>
            </div>

            <EmployeeForm
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                initialData={employee}
                onSubmit={(data) => updateEmployeeMutation.mutate(data)}
            />
        </div>
    );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import PayrollModal from '../components/PayrollModal';
import {
    DollarSign,
    Search,
    Download,
    FileText,
    TrendingUp,
    MoreHorizontal
} from 'lucide-react';
import { subDays, isAfter } from 'date-fns';
import { useToast } from '../../../context/ToastContext';

export default function PayrollList() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: salaries, isLoading } = useQuery({
        queryKey: ['salaries'],
        queryFn: mockDataService.getSalaries,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [periodFilter, setPeriodFilter] = useState('Monthly'); // Weekly, Monthly, Yearly
    const [isModalOpen, setIsModalOpen] = useState(false);

    const processPayrollMutation = useMutation({
        mutationFn: (period) => {
            return new Promise(resolve => {
                // The modal handles the delay UI, but we can verify execution here
                setTimeout(() => resolve(mockDataService.processPayroll(period)), 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['salaries']);
            showToast('Payroll processed successfully', 'success');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateSalary(id, { status })), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['salaries']);
            showToast('Payment status updated', 'success');
        }
    });

    const handleStatusClick = (record) => {
        const newStatus = record.status === 'Paid' ? 'Pending' : 'Paid';
        updateStatusMutation.mutate({ id: record.id, status: newStatus });
    };

    const filteredSalaries = salaries?.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesPeriod = true;
        const recordDate = new Date(record.paymentDate);
        const today = new Date();

        if (periodFilter === 'Weekly') {
            matchesPeriod = isAfter(recordDate, subDays(today, 7));
        } else if (periodFilter === 'Monthly') {
            matchesPeriod = isAfter(recordDate, subDays(today, 30));
        } else if (periodFilter === 'Yearly') {
            matchesPeriod = isAfter(recordDate, subDays(today, 365));
        }

        return matchesSearch && matchesPeriod;
    });

    const handleRunPayroll = () => {
        setIsModalOpen(true);
    };

    const handleConfirmRun = (period) => {
        processPayrollMutation.mutate(period);
    };

    const handleDownload = (record) => {
        showToast(`Downloading payslip for ${record.employeeName}...`, 'success');
    };

    if (isLoading) return <div className="p-8 text-center">Loading payroll data...</div>;

    const totalStats = filteredSalaries?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Payroll Service</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage employee salaries and payments</p>
                    </div>
                    <button
                        onClick={handleRunPayroll}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm shadow-indigo-200"
                    >
                        <DollarSign className="w-4 h-4" />
                        Run Payroll
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-bl-full -mr-2 -mt-2" />
                        <div className="flex items-center gap-4 relative">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Disbursed</p>
                                <h3 className="text-2xl font-bold text-slate-900">${totalStats.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full -mr-2 -mt-2" />
                        <div className="flex items-center gap-4 relative">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Avg Salary</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    ${(totalStats / (filteredSalaries?.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-bl-full -mr-2 -mt-2" />
                        <div className="flex items-center gap-4 relative">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Pending Slips</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {filteredSalaries?.filter(s => s.status === 'Pending').length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
                    <div className="relative max-w-full md:max-w-md w-full">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full pl-10 pr-4 py-2.5 input-premium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">View by:</span>
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white w-full md:w-40"
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-premium">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalaries?.map((record) => (
                                    <tr key={record.id}>
                                        <td className="font-medium text-slate-900 whitespace-nowrap">
                                            {record.employeeName}
                                        </td>
                                        <td className="text-slate-600 whitespace-nowrap">
                                            {new Date(record.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="text-slate-900 font-semibold whitespace-nowrap">
                                            ${record.amount.toLocaleString()}
                                        </td>
                                        <td className="text-slate-600 whitespace-nowrap">
                                            {record.method}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <button
                                                onClick={() => handleStatusClick(record)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-sm cursor-pointer ${record.status === 'Paid'
                                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                                    }`}
                                                title="Click to toggle status"
                                            >
                                                {record.status}
                                            </button>
                                        </td>
                                        <td className="text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleDownload(record)}
                                                className="text-slate-400 hover:text-indigo-600 p-2"
                                                title="Download Payslip"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PayrollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRunPayroll={handleConfirmRun}
                totalEmployees={15} // Using static count or could fetch from employee query
            />
        </div>
    );
}

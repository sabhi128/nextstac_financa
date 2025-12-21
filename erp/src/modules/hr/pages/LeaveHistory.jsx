import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { Search, Calendar, Filter, User, AlertCircle, FileText } from 'lucide-react';
import { subDays, isAfter, parseISO } from 'date-fns';

export default function LeaveHistory() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [periodFilter, setPeriodFilter] = useState('Yearly');

    // 1. Fetch Employees for Dropdown
    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: mockDataService.getEmployees,
    });

    // 2. Fetch Leaves ONLY when employee is selected
    const { data: leaves, isLoading } = useQuery({
        queryKey: ['employee-leaves', selectedEmployeeId],
        queryFn: () => mockDataService.getEmployeeLeaves(selectedEmployeeId),
        enabled: !!selectedEmployeeId, // Dependent query
    });

    const selectedEmployee = employees?.find(e => e.id === selectedEmployeeId);

    // 3. Filter Logic
    const filteredLeaves = leaves?.filter(leave => {
        let matchesPeriod = true;
        const leaveDate = new Date(leave.startDate);
        const today = new Date();

        if (periodFilter === 'Weekly') {
            matchesPeriod = isAfter(leaveDate, subDays(today, 7));
        } else if (periodFilter === 'Monthly') {
            matchesPeriod = isAfter(leaveDate, subDays(today, 30));
        } else if (periodFilter === 'Yearly') {
            matchesPeriod = isAfter(leaveDate, subDays(today, 365));
        }
        return matchesPeriod;
    });

    const getStatusColor = (status) => {
        return status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-[1200px] mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Leave History</h2>
                    <p className="text-slate-500 text-sm mt-1">View individual employee leave records and status</p>
                </div>

                {/* Selection Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Select Employee to View</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700"
                            >
                                <option value="">-- Choose Employee --</option>
                                {employees?.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedEmployeeId && (
                        <div className="w-full md:w-48">
                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Filter Period</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={periodFilter}
                                    onChange={(e) => setPeriodFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700"
                                >
                                    <option value="Weekly">Last 7 Days</option>
                                    <option value="Monthly">Last 30 Days</option>
                                    <option value="Yearly">Last Year</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {!selectedEmployeeId ? (
                    // Empty State
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No Employee Selected</h3>
                        <p className="text-slate-500 max-w-sm mt-2">Please select an employee from the dropdown above to view their complete leave history and records.</p>
                    </div>
                ) : (
                    // Data Table
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3">
                            {selectedEmployee?.avatar && (
                                <img src={selectedEmployee.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                            )}
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</h3>
                                <p className="text-slate-500 text-sm">{selectedEmployee?.position} • {selectedEmployee?.department}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {isLoading ? (
                                <div className="p-8 text-center text-slate-500">Loading history...</div>
                            ) : filteredLeaves?.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-900 font-medium">No records found</p>
                                    <p className="text-slate-500 text-sm">No leave history found for this period.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Leave Type</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Duration</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Dates</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredLeaves.map((record) => (
                                                <tr key={record.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {record.type}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {record.days} days
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                                        {record.reason}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

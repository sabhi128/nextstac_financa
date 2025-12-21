
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Calendar,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    Download
} from 'lucide-react';


export default function LeaveManagement() {
    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves-all'],
        queryFn: mockDataService.getAllLeaves,
    });

    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise(resolve => {
                resolve(mockDataService.updateLeaveStatus(id, status));
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leaves-all']);
            queryClient.invalidateQueries(['leave-requests']); // Invalidate dashboard widget too
            queryClient.invalidateQueries(['employee-leaves']); // Invalidate history too
        }
    });

    const handleAction = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    if (isLoading) return <div className="p-8 text-center">Loading leave requests...</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'Rejected':
                return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-bold"><XCircle className="w-3 h-3" /> Rejected</span>;
            case 'Pending':
                return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Leave Management</h2>
                        <p className="text-slate-500 text-sm">Review/approve employee leave requests</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Employee</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Leave Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Duration</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaves?.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {request.employeeName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {request.type}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex flex-col text-xs">
                                            <span>From: {new Date(request.startDate).toLocaleDateString()}</span>
                                            <span>To: {new Date(request.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={request.reason}>
                                        {request.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {request.status === 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(request.id, 'Approved')}
                                                    className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, 'Rejected')}
                                                    className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

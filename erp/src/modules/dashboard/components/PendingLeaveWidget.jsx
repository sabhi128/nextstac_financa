import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { Check, X, Clock, Calendar } from 'lucide-react';

export default function PendingLeaveWidget() {
    const queryClient = useQueryClient();
    const { data: requests, isLoading } = useQuery({
        queryKey: ['leave-requests'],
        queryFn: mockDataService.getLeaveRequests,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise(resolve => {
                setTimeout(() => resolve(mockDataService.updateLeaveStatus(id, status)), 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leaves-all']); // Sync with main list
            queryClient.invalidateQueries(['employee-leaves']); // Sync with history
        }
    });

    const handleAction = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    if (isLoading) return <div className="p-6 text-center text-sm text-slate-500">Loading requests...</div>;

    if (!requests || requests.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                </div>
                <p className="text-slate-900 font-medium">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending leave requests.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {requests.map(request => (
                <div key={request.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm truncate">{request.employeeName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 dark:border-transparent">
                                {request.type}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 mb-1.5">{request.reason}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {request.days} days
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(request.requestedOn).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => handleAction(request.id, 'Rejected')}
                            disabled={updateStatusMutation.isPending}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleAction(request.id, 'Approved')}
                            disabled={updateStatusMutation.isPending}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            title="Approve"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

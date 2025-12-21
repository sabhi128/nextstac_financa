import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { Phone, Mail, Calendar, CheckSquare } from 'lucide-react';


export default function FollowUpList() {
    const { data: followUps, isLoading } = useQuery({
        queryKey: ['followUps'],
        queryFn: mockDataService.getFollowUps,
    });

    if (isLoading) return <div className="p-8 text-center">Loading items...</div>;

    const getIcon = (type) => {
        switch (type) {
            case 'Call': return <Phone className="w-5 h-5" />;
            case 'Email': return <Mail className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Follow-ups</h2>
                        <p className="text-slate-500 text-sm">Scheduled actions and reminders</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {followUps?.map(item => (
                            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{item.type} with {item.contact}</h3>
                                    <p className="text-sm text-slate-500">{item.notes}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">{new Date(item.date).toLocaleDateString()}</p>
                                    <span className="text-xs text-slate-500">{item.status}</span>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600">
                                    <CheckSquare className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

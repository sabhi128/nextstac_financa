import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { useAuth } from '../../../context/AuthContext';
import {
    Clock,
    Calendar,
    FileText,
    CheckCircle,
    Briefcase,
    Coffee
} from 'lucide-react';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock fetching personal data
    const { data: attendance } = useQuery({ queryKey: ['attendance'], queryFn: mockDataService.getAttendance });
    const { data: leaves } = useQuery({ queryKey: ['leaves'], queryFn: mockDataService.getLeaveRequests });

    // Filter for "my" records (mock logic: just take first 5)
    const myAttendance = attendance?.slice(0, 5) || [];
    const myLeaves = leaves?.slice(0, 2) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Employee'}!</h1>
                    <p className="text-slate-500 text-sm">Here is your daily overview</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm font-mono text-slate-600">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clock In Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg col-span-1 md:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-100 border border-green-500/30 rounded-full text-xs font-bold">
                            On Time
                        </span>
                    </div>
                    <div className="space-y-1 mb-6">
                        <p className="text-indigo-100 text-sm">Current Status</p>
                        <h3 className="text-2xl font-bold">Checked In</h3>
                        <p className="text-indigo-200 text-xs">Since 09:00 AM</p>
                    </div>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors">
                        Check Out
                    </button>
                </div>

                {/* Leave Balance */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Coffee className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className='space-y-1'>
                            <p className="text-slate-500 text-xs font-medium">Casual Leave</p>
                            <p className="text-xl font-bold text-slate-900">8 <span className="text-xs text-slate-400 font-normal">/ 12</span></p>
                        </div>
                        <div className='space-y-1'>
                            <p className="text-slate-500 text-xs font-medium">Sick Leave</p>
                            <p className="text-xl font-bold text-slate-900">5 <span className="text-xs text-slate-400 font-normal">/ 7</span></p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Holidays */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Upcoming Holiday</h3>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm">National Holiday</p>
                        <p className="text-xs text-slate-500">Next Friday, 24th Dec</p>
                    </div>
                </div>
            </div>

            {/* Attendance & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Your Attendance</h2>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-600">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-600">In / Out</th>
                                <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myAttendance.map(rec => (
                                <tr key={rec.id}>
                                    <td className="px-6 py-3 text-slate-900">{rec.date}</td>
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{rec.checkIn} - {rec.checkOut}</td>
                                    <td className="px-6 py-3">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{rec.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">My Leave Requests</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {myLeaves.map(leave => (
                            <div key={leave.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <FileText className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{leave.type}</p>
                                        <p className="text-xs text-slate-500">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {leave.status}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-2 text-indigo-600 text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors">
                            Apply for Leave
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

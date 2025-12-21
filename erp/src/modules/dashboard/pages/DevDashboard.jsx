import React from 'react';
import {
    Code,
    Database,
    Server,
    Activity,
    FileText,
    GitBranch,
    Terminal,
    ArrowUpRight,
    Cpu,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../../components/ui/animations';
import { useToast } from '../../../context/ToastContext';

export default function DevDashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const stats = [
        {
            label: 'System Uptime',
            value: '99.99%',
            icon: Server,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            gradient: 'from-emerald-500/10 to-teal-500/10'
        },
        {
            label: 'API Latency',
            value: '45ms',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            gradient: 'from-blue-500/10 to-cyan-500/10'
        },
        {
            label: 'Active Sessions',
            value: '128',
            icon: Cpu,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            gradient: 'from-purple-500/10 to-fuchsia-500/10'
        },
        {
            label: 'Open Issues',
            value: '12',
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            gradient: 'from-amber-500/10 to-orange-500/10'
        },
    ];

    const handleSystemLogs = () => {
        showToast("Fetching system logs...", "info");
        // Simulate navigation or action
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Developer Console</h1>
                    <p className="text-slate-500 mt-1">System monitoring and administration</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSystemLogs}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2 font-medium"
                    >
                        <Terminal className="w-4 h-4" />
                        System Logs
                    </button>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            custom={index}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    variants={cardVariants}
                    custom={4}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => navigate('/audit')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group"
                        >
                            View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-md transition-all cursor-default group">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Code className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Deployed v2.4.0</p>
                                <p className="text-xs text-slate-500 font-medium">2 hours ago • via CI/CD</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-md transition-all cursor-default group">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Database Backup</p>
                                <p className="text-xs text-slate-500 font-medium">5 hours ago • Automated</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    custom={5}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Documentation
                        </h3>
                        <button
                            onClick={() => navigate('/documents')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group"
                        >
                            View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">API Reference</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Updated 1 day ago</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Architecture Guide</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">Updated 3 days ago</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

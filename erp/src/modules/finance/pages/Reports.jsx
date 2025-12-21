import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { FileText, PieChart, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';
import TrialBalance from '../components/reports/TrialBalance';
import IncomeStatement from '../components/reports/IncomeStatement';
import BalanceSheet from '../components/reports/BalanceSheet';


export default function Reports() {
    const [activeTab, setActiveTab] = useState('summary');
    const [dateRange, setDateRange] = useState('all'); // all, month

    const { data: accounts, isLoading: accountsLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: mockDataService.getAccounts,
    });

    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: mockDataService.getTransactions,
    });

    if (accountsLoading || transactionsLoading) {
        return <div className="p-12 text-center text-slate-500">Loading Financial Reports...</div>;
    }

    // Filter transactions based on dateRange
    const filteredTransactions = transactions?.filter(t => {
        if (dateRange === 'all') return true;
        if (dateRange === 'month') {
            const date = new Date(t.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        return true;
    }) || [];

    const handleExport = () => {
        window.print();
    };

    const tabs = [
        { id: 'summary', label: 'Report Settings', icon: FileText },
        { id: 'income', label: 'Income Statement', icon: TrendingUp },
        { id: 'balance', label: 'Balance Sheet', icon: PieChart },
        { id: 'trial', label: 'Trial Balance', icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white text-slate-900">

            <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Financial Reports</h2>
                        <p className="text-xs text-slate-500">Generate and view your financial statements</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDateRange(dateRange === 'month' ? 'all' : 'month')}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded text-xs font-medium transition-colors ${dateRange === 'month'
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{dateRange === 'month' ? 'Showing: This Month' : 'Filter: This Month'}</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium transition-colors shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Centered Tabs */}
                <div className="flex justify-center mb-6 print:hidden">
                    <div className="bg-white rounded-full border border-slate-200 p-1 flex shadow-sm">
                        {tabs.filter(t => t.id !== 'summary').map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                px-4 py-1.5 rounded-full text-xs font-bold transition-all
                                ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="animate-in slide-in-from-bottom-4 duration-500 ease-out print:animate-none">
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Financial Reports Hub</h2>
                            <p className="text-sm text-slate-500 max-w-md mx-auto">
                                Select a tab above to view the detailed financial statement.
                                You can filter by date range and export reports using the controls at the top right.
                            </p>
                        </div>
                    )}

                    {activeTab === 'trial' && (
                        <TrialBalance
                            accounts={accounts || []}
                            transactions={filteredTransactions}
                        />
                    )}

                    {activeTab === 'income' && (
                        <IncomeStatement
                            accounts={accounts || []}
                            transactions={filteredTransactions}
                        />
                    )}

                    {activeTab === 'balance' && (
                        <BalanceSheet
                            accounts={accounts || []}
                            transactions={filteredTransactions}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

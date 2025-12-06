import { useState, useMemo } from 'react';
import {
    generateReportData,
    downloadPDF,
    downloadExcel,
    filterTransactionsByDateRange
} from '../services/reportService';
import { calculateAccountBalance, calculateNetProfit, isDebitNormalBalance } from '../utils/accountingCalculations';

const GenerateReports = ({ accounts, transactions }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('current-month');
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Custom date range
    const [useCustomRange, setUseCustomRange] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Generate custom report data
    const generateCustomReportData = (startDate, endDate) => {
        const filteredTransactions = filterTransactionsByDateRange(transactions, startDate, endDate);
        
        // Helper to get proper signed balance based on account type
        const getSignedBalance = (account, txns) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, txns);
            if (isDebitNormalBalance(account.type) || account.name === 'Drawings') {
                return debitTotal - creditTotal;
            }
            return creditTotal - debitTotal;
        };

        // Calculate balances
        const accountBalances = accounts.map(account => {
            const { debitTotal, creditTotal, balanceAmount, balanceType, normalBalance } = 
                calculateAccountBalance(account, filteredTransactions);
            const signedBalance = getSignedBalance(account, filteredTransactions);
            
            return {
                ...account,
                debitTotal,
                creditTotal,
                balance: balanceAmount,
                signedBalance,
                balanceType,
                normalBalance
            };
        }).filter(acc => acc.balance > 0);

        // Calculate totals
        const totalAssets = accounts
            .filter(a => a.type === 'Asset')
            .reduce((sum, account) => {
                const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
                return sum + (debitTotal - creditTotal);
            }, 0);

        const totalLiabilities = accounts
            .filter(a => a.type === 'Liability')
            .reduce((sum, account) => {
                const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
                return sum + (creditTotal - debitTotal);
            }, 0);

        const totalRevenue = accounts
            .filter(a => a.type === 'Revenue')
            .reduce((sum, account) => {
                const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
                return sum + (creditTotal - debitTotal);
            }, 0);

        const totalExpenses = accounts
            .filter(a => a.type === 'Expense')
            .reduce((sum, account) => {
                const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
                return sum + (debitTotal - creditTotal);
            }, 0);

        const netProfit = totalRevenue - totalExpenses;

        // Equity
        const capitalAccounts = accounts.filter(a => a.type === 'Equity' && a.name !== 'Drawings');
        const totalCapital = capitalAccounts.reduce((sum, account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
            return sum + (creditTotal - debitTotal);
        }, 0);

        const drawingsAccount = accounts.find(a => a.name === 'Drawings');
        const drawingsBalance = drawingsAccount 
            ? calculateAccountBalance(drawingsAccount, filteredTransactions).debitTotal - 
              calculateAccountBalance(drawingsAccount, filteredTransactions).creditTotal
            : 0;

        const totalEquity = totalCapital + netProfit - drawingsBalance;

        const totalDebits = accountBalances
            .filter(a => a.balanceType === 'Debit')
            .reduce((sum, a) => sum + a.balance, 0);
        const totalCredits = accountBalances
            .filter(a => a.balanceType === 'Credit')
            .reduce((sum, a) => sum + a.balance, 0);

        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        return {
            periodType: 'custom',
            dateRange: {
                startDate,
                endDate,
                label: `${formatDate(startDate)} - ${formatDate(endDate)}`
            },
            transactionCount: filteredTransactions.length,
            transactions: filteredTransactions,
            accountBalances,
            assetAccounts: accountBalances.filter(a => a.type === 'Asset'),
            liabilityAccounts: accountBalances.filter(a => a.type === 'Liability'),
            equityAccounts: accountBalances.filter(a => a.type === 'Equity'),
            revenueAccounts: accountBalances.filter(a => a.type === 'Revenue'),
            expenseAccounts: accountBalances.filter(a => a.type === 'Expense'),
            summary: {
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalRevenue,
                totalExpenses,
                netProfit,
                totalDebits,
                totalCredits,
                isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
            }
        };
    };

    // Generate report based on selected period or custom range
    const currentReport = useMemo(() => {
        if (!accounts.length) return null;
        
        if (useCustomRange && customStartDate && customEndDate) {
            return generateCustomReportData(customStartDate, customEndDate);
        }
        
        if (!transactions.length) return null;
        return generateReportData(accounts, transactions, selectedPeriod);
    }, [accounts, transactions, selectedPeriod, useCustomRange, customStartDate, customEndDate]);

    const handleDownloadPDF = async () => {
        if (!currentReport) return;
        setIsDownloading(true);
        try {
            downloadPDF(currentReport);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!currentReport) return;
        setIsDownloading(true);
        try {
            downloadExcel(currentReport);
        } finally {
            setIsDownloading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const periodOptions = [
        { value: 'current-week', label: 'This Week', desc: 'Current week' },
        { value: 'current-month', label: 'This Month', desc: 'Current month' },
        { value: 'current-year', label: 'This Year', desc: 'Year to date' },
        { value: 'weekly', label: 'Last Week', desc: 'Previous week' },
        { value: 'monthly', label: 'Last Month', desc: 'Previous month' },
        { value: 'yearly', label: 'Last Year', desc: 'Previous year' },
    ];

    // Quick preset buttons for custom range
    const setQuickRange = (months) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);
        setCustomStartDate(start.toISOString().split('T')[0]);
        setCustomEndDate(end.toISOString().split('T')[0]);
        setUseCustomRange(true);
    };

    const setQuickYearRange = (years) => {
        const end = new Date();
        const start = new Date();
        start.setFullYear(start.getFullYear() - years);
        setCustomStartDate(start.toISOString().split('T')[0]);
        setCustomEndDate(end.toISOString().split('T')[0]);
        setUseCustomRange(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Generate Reports</h2>
                <p className="text-slate-500 text-sm mt-1">Select a time period and download your financial reports</p>
            </div>

            {/* Period Selection Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toggle between preset and custom */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setUseCustomRange(false)}
                        className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            !useCustomRange 
                                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Preset Periods
                    </button>
                    <button
                        onClick={() => setUseCustomRange(true)}
                        className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            useCustomRange 
                                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Custom Date Range
                    </button>
                </div>

                <div className="p-6">
                    {!useCustomRange ? (
                        /* Preset Period Selection */
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedPeriod(option.value)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                        selectedPeriod === option.value
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`text-sm font-semibold block ${
                                        selectedPeriod === option.value ? 'text-indigo-600' : 'text-slate-700'
                                    }`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">
                                        {option.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Custom Date Range Selection */
                        <div className="space-y-4">
                            {/* Quick Presets */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Select</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setQuickRange(3)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 3 Months
                                    </button>
                                    <button onClick={() => setQuickRange(6)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 6 Months
                                    </button>
                                    <button onClick={() => setQuickYearRange(1)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 1 Year
                                    </button>
                                    <button onClick={() => setQuickYearRange(2)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 2 Years
                                    </button>
                                    <button onClick={() => setQuickYearRange(3)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 3 Years
                                    </button>
                                    <button onClick={() => setQuickYearRange(5)} className="px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        Last 5 Years
                                    </button>
                                </div>
                            </div>

                            {/* Custom Date Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            {/* Date Range Info */}
                            {customStartDate && customEndDate && (
                                <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-2 text-sm text-indigo-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>
                                        Selected: {new Date(customStartDate).toLocaleDateString()} to {new Date(customEndDate).toLocaleDateString()}
                                        {' '}({Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24))} days)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Preview */}
            {currentReport && currentReport.transactionCount > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Report Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {useCustomRange ? 'Custom Period Report' : selectedPeriod.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Report'}
                                </h3>
                                <p className="text-slate-300 text-sm mt-1">{currentReport.dateRange.label}</p>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                currentReport.summary.isBalanced
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-red-500/20 text-red-300'
                            }`}>
                                {currentReport.summary.isBalanced ? '✓ Books Balanced' : '⚠ Check Entries'}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="p-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Revenue</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">
                                    {formatCurrency(currentReport.summary.totalRevenue)}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Expenses</p>
                                <p className="text-2xl font-bold text-red-700 mt-1">
                                    {formatCurrency(currentReport.summary.totalExpenses)}
                                </p>
                            </div>
                            <div className={`rounded-xl p-4 border ${
                                currentReport.summary.netProfit >= 0
                                    ? 'bg-indigo-50 border-indigo-100'
                                    : 'bg-orange-50 border-orange-100'
                            }`}>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${
                                    currentReport.summary.netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'
                                }`}>Net Profit</p>
                                <p className={`text-2xl font-bold mt-1 ${
                                    currentReport.summary.netProfit >= 0 ? 'text-indigo-700' : 'text-orange-700'
                                }`}>
                                    {formatCurrency(currentReport.summary.netProfit)}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Transactions</p>
                                <p className="text-2xl font-bold text-slate-700 mt-1">
                                    {currentReport.transactionCount}
                                </p>
                            </div>
                        </div>

                        {/* Financial Position Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Assets</p>
                                <p className="text-lg font-bold text-slate-800">{formatCurrency(currentReport.summary.totalAssets)}</p>
                            </div>
                            <div className="text-center border-x border-slate-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Liabilities</p>
                                <p className="text-lg font-bold text-slate-800">{formatCurrency(currentReport.summary.totalLiabilities)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Equity</p>
                                <p className="text-lg font-bold text-slate-800">{formatCurrency(currentReport.summary.totalEquity)}</p>
                            </div>
                        </div>

                        {/* Trial Balance Table */}
                        {currentReport.accountBalances && currentReport.accountBalances.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-900">Trial Balance Summary</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Account</th>
                                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                                                <th className="text-right py-3 px-4 font-semibold text-slate-700">Debit</th>
                                                <th className="text-right py-3 px-4 font-semibold text-slate-700">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentReport.accountBalances.slice(0, 10).map((acc, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-2.5 px-4 text-slate-800">{acc.name}</td>
                                                    <td className="py-2.5 px-4">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            acc.type === 'Asset' ? 'bg-blue-100 text-blue-700' :
                                                            acc.type === 'Liability' ? 'bg-orange-100 text-orange-700' :
                                                            acc.type === 'Equity' ? 'bg-purple-100 text-purple-700' :
                                                            acc.type === 'Revenue' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {acc.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                                                        {acc.balanceType === 'Debit' ? formatCurrency(acc.balance) : '-'}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                                                        {acc.balanceType === 'Credit' ? formatCurrency(acc.balance) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-100 font-semibold">
                                                <td className="py-3 px-4" colSpan={2}>Total</td>
                                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(currentReport.summary.totalDebits)}</td>
                                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(currentReport.summary.totalCredits)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {currentReport.accountBalances.length > 10 && (
                                    <div className="px-4 py-2 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                                        + {currentReport.accountBalances.length - 10} more accounts in full report
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Download Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF Report
                            </button>
                            <button
                                onClick={handleDownloadExcel}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Data State */}
            {((!currentReport || currentReport.transactionCount === 0) && (!useCustomRange || (customStartDate && customEndDate))) && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Transactions Found</h3>
                    <p className="text-slate-500 text-sm">
                        There are no transactions for the selected period. Try selecting a different time range or add some transactions first.
                    </p>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-indigo-800">
                        <p className="font-semibold">Report Contents & Automatic Reports</p>
                        <p className="text-indigo-600 mt-1">
                            Each report includes: Executive Summary, Trial Balance, Income Statement, Balance Sheet, and Transaction Details.
                        </p>
                        <p className="text-indigo-600 mt-1">
                            <strong>Auto Popups:</strong> Weekly reports appear every Sunday, Monthly on the 1st, and Yearly on January 1st.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateReports;

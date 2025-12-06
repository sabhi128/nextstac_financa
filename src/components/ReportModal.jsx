import { useState } from 'react';
import { downloadPDF, downloadExcel } from '../services/reportService';

const ReportModal = ({ isOpen, onClose, reportData }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !reportData) return null;

    const { periodType, dateRange, summary, transactionCount, accountBalances } = reportData;
    const periodLabel = periodType.charAt(0).toUpperCase() + periodType.slice(1);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            downloadPDF(reportData);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadExcel = async () => {
        setIsDownloading(true);
        try {
            downloadExcel(reportData);
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full transform transition-all">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-2xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{periodLabel} Financial Report</h2>
                                    <p className="text-indigo-200 text-sm">{dateRange.label}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Revenue</p>
                                <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(summary.totalRevenue)}</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Expenses</p>
                                <p className="text-xl font-bold text-red-700 mt-1">{formatCurrency(summary.totalExpenses)}</p>
                            </div>
                            <div className={`rounded-xl p-4 border ${summary.netProfit >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-orange-50 border-orange-200'}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${summary.netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>Net Profit</p>
                                <p className={`text-xl font-bold mt-1 ${summary.netProfit >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>{formatCurrency(summary.netProfit)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Transactions</p>
                                <p className="text-xl font-bold text-slate-700 mt-1">{transactionCount}</p>
                            </div>
                        </div>

                        {/* Financial Position */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Financial Position</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Assets</p>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(summary.totalAssets)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Liabilities</p>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(summary.totalLiabilities)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Owner's Equity</p>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(summary.totalEquity)}</p>
                                </div>
                            </div>

                            {/* Balance Status */}
                            <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${summary.isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                                {summary.isBalanced ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Books are balanced - Debits equal Credits
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Warning: Books are not balanced
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Trial Balance Table */}
                        {accountBalances && accountBalances.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                                            {accountBalances.slice(0, 8).map((acc, idx) => (
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
                                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(summary.totalDebits)}</td>
                                                <td className="py-3 px-4 text-right font-mono">{formatCurrency(summary.totalCredits)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {accountBalances.length > 8 && (
                                    <div className="px-4 py-2 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                                        + {accountBalances.length - 8} more accounts in full report
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Download Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                            <button
                                onClick={handleDownloadExcel}
                                disabled={isDownloading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;

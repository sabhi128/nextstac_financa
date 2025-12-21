import React from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, X } from 'lucide-react';

const TAccountView = ({ account, transactions, onClose }) => {
    // Filter transactions for this account
    const accountTransactions = transactions.filter(t =>
        // Allow fallback to direct object access for mock data robustness
        t.debit_account_id === account.id ||
        t.credit_account_id === account.id ||
        t.debitAccount?.id === account.id ||
        t.creditAccount?.id === account.id
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = accountTransactions.map(t => {
        const isDebit = t.debit_account_id === account.id || t.debitAccount?.id === account.id;
        const amount = parseFloat(t.amount);

        if (account.normal_balance === 'Debit' || account.normalBalance === 'Debit') {
            runningBalance += isDebit ? amount : -amount;
        } else {
            runningBalance += isDebit ? -amount : amount;
        }

        return { ...t, isDebit, runningBalance };
    });

    const totalDebits = accountTransactions
        .filter(t => t.debit_account_id === account.id || t.debitAccount?.id === account.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalCredits = accountTransactions
        .filter(t => t.credit_account_id === account.id || t.creditAccount?.id === account.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const endingBalance = Math.abs(totalDebits - totalCredits);
    const balanceSide = totalDebits > totalCredits ? 'Debit' : 'Credit';

    return (
        <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-50 px-4 md:px-8 py-4 md:py-6 border-b-2 border-slate-900 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{account.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white px-2 py-1 rounded border-2 border-slate-200">
                            {account.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white px-2 py-1 rounded border-2 border-slate-200">
                            {account.normal_balance || account.normalBalance} Balance
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-white hover:bg-red-50 text-slate-900 hover:text-red-600 border-2 border-slate-200 hover:border-red-600 rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                    <X className="w-5 h-5 stroke-[3]" />
                </button>
            </div>

            {/* T-Account Visual */}
            <div className="p-4 md:p-8 flex-1 overflow-auto bg-slate-50/50">
                <div className="max-w-6xl mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] border-2 border-slate-900">

                    {/* T-Shape Header */}
                    <div className="flex border-b-4 border-slate-900 pb-4 mb-6">
                        <div className="w-1/2 text-center font-black text-lg md:text-xl uppercase tracking-widest border-r-4 border-slate-900 text-slate-900">Debit</div>
                        <div className="w-1/2 text-center font-black text-lg md:text-xl uppercase tracking-widest text-slate-900">Credit</div>
                    </div>

                    {/* Transactions List */}
                    <div className="flex flex-col md:flex-row relative min-h-[400px]">
                        {/* Vertical Line (Desktop Only) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-900 transform -translate-x-1/2 opacity-20"></div>

                        {/* Debits Column */}
                        <div className="w-full md:w-1/2 pr-0 md:pr-6 space-y-3 mb-6 md:mb-0">
                            {transactionsWithBalance.filter(t => t.isDebit).map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm group hover:bg-emerald-50 p-3 rounded-lg border-2 border-transparent hover:border-emerald-200 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{new Date(t.date).toLocaleDateString()}</span>
                                        <span className="text-slate-800 font-bold truncate max-w-[150px] md:max-w-[200px]" title={t.description}>{t.description}</span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                        ${parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Divider */}
                        <div className="md:hidden h-1 bg-slate-200 my-4 relative">
                            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-400">CREDITS</span>
                        </div>

                        {/* Credits Column */}
                        <div className="w-full md:w-1/2 pl-0 md:pl-6 space-y-3">
                            {transactionsWithBalance.filter(t => !t.isDebit).map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm group hover:bg-indigo-50 p-3 rounded-lg border-2 border-transparent hover:border-indigo-200 transition-colors">
                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                        ${parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{new Date(t.date).toLocaleDateString()}</span>
                                        <span className="text-slate-800 font-bold truncate max-w-[150px] md:max-w-[200px] text-right" title={t.description}>{t.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Footer */}
                    <div className="flex flex-col md:flex-row border-t-4 border-slate-900 pt-6 mt-6 gap-6 md:gap-0">
                        <div className="w-full md:w-1/2 md:pr-6 flex justify-between md:block md:text-right">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Total Debits</span>
                            <span className="font-mono font-bold text-slate-900 text-xl md:text-2xl">
                                ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-full md:w-1/2 md:pl-6 text-left border-l-0 md:border-l-4 border-transparent flex justify-between md:block">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Total Credits</span>
                            <span className="font-mono font-bold text-slate-900 text-xl md:text-2xl">
                                ${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Ending Balance */}
                    <div className="flex justify-center mt-8 md:mt-12">
                        <div className={`
                            w-full md:w-auto px-6 md:px-10 py-4 md:py-6 rounded-2xl font-black text-lg md:text-2xl border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4
                            ${balanceSide === (account.normal_balance || account.normalBalance)
                                ? 'bg-emerald-500 text-white border-emerald-900 shadow-emerald-900/20'
                                : 'bg-amber-500 text-white border-amber-900 shadow-amber-900/20'}
                        `}>
                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            <div className="text-center md:text-left">
                                <span className="block text-xs opacity-90 font-bold uppercase tracking-widest mb-1">Ending Balance ({balanceSide})</span>
                                {endingBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TAccountView;

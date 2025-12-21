import React from 'react';
import { calculateAccountBalance } from '../../../../utils/accountingCalculations';

const IncomeStatement = ({ transactions, accounts }) => {

    const getRevenueBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return creditTotal - debitTotal;
    };

    const getExpenseBalance = (account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        return debitTotal - creditTotal;
    };

    // Revenue accounts
    const revenueAccounts = accounts.filter(a => a.type === 'Revenue');
    const totalRevenue = revenueAccounts.reduce((sum, account) => sum + getRevenueBalance(account), 0);

    // COGS
    const cogsAccounts = accounts.filter(a => a.name === 'Cost of Goods Sold');
    const cogsTotal = cogsAccounts.reduce((sum, account) => sum + getExpenseBalance(account), 0);

    // Gross Profit
    const grossProfit = totalRevenue - cogsTotal;

    // Operating Expenses
    const operatingExpenseAccounts = accounts.filter(a =>
        a.type === 'Expense' && a.name !== 'Cost of Goods Sold'
    );
    const operatingExpensesTotal = operatingExpenseAccounts.reduce((sum, account) => sum + getExpenseBalance(account), 0);

    // Net Profit
    const netProfit = grossProfit - operatingExpensesTotal;

    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 text-center">
                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2">Income Statement</h2>
                <p className="text-slate-500 font-mono text-sm">For the Period Ended {new Date().toLocaleDateString()}</p>
            </div>

            <div className="p-8 space-y-8 font-mono text-slate-800">

                {/* Revenue Section */}
                <div>
                    <h3 className="font-bold text-slate-900 uppercase mb-4 border-b border-slate-200 pb-2">Revenue</h3>
                    {revenueAccounts.map(account => {
                        const balance = getRevenueBalance(account);
                        if (balance === 0) return null;
                        return (
                            <div key={account.id} className="flex justify-between py-2 hover:bg-slate-50 pl-4 rounded transition-colors">
                                <span>{account.name}</span>
                                <span className="text-emerald-700 font-medium">{formatCurrency(balance)}</span>
                            </div>
                        );
                    })}
                    <div className="flex justify-between py-2 font-bold border-t border-slate-900 mt-2">
                        <span>Total Revenue</span>
                        <span className="text-emerald-700">${formatCurrency(totalRevenue)}</span>
                    </div>
                </div>

                {/* COGS */}
                {cogsAccounts.length > 0 && (
                    <div>
                        <h3 className="font-bold text-slate-900 uppercase mb-4 border-b border-slate-200 pb-2">Cost of Sales</h3>
                        {cogsAccounts.map(account => {
                            const balance = getExpenseBalance(account);
                            if (balance === 0) return null;
                            return (
                                <div key={account.id} className="flex justify-between py-2 hover:bg-slate-50 pl-4 rounded transition-colors">
                                    <span>{account.name}</span>
                                    <span className="text-red-600">({formatCurrency(balance)})</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between py-2 font-bold border-t border-slate-900 mt-2">
                            <span>Total Cost of Goods Sold</span>
                            <span className="text-red-600">({formatCurrency(cogsTotal)})</span>
                        </div>
                    </div>
                )}

                {/* Gross Profit */}
                <div className="flex justify-between py-4 font-bold text-lg bg-slate-50 px-4 border-y-2 border-slate-200 rounded-lg">
                    <span>Gross Profit</span>
                    <span className={grossProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                        ${formatCurrency(grossProfit)}
                    </span>
                </div>

                {/* Operating Expenses */}
                <div>
                    <h3 className="font-bold text-slate-900 uppercase mb-4 border-b border-slate-200 pb-2">Operating Expenses</h3>
                    {operatingExpenseAccounts.map(account => {
                        const balance = getExpenseBalance(account);
                        if (balance === 0) return null;
                        return (
                            <div key={account.id} className="flex justify-between py-2 hover:bg-slate-50 pl-4 rounded transition-colors">
                                <span>{account.name}</span>
                                <span className="text-red-600">({formatCurrency(balance)})</span>
                            </div>
                        );
                    })}
                    <div className="flex justify-between py-2 font-bold border-t border-slate-900 mt-2">
                        <span>Total Operating Expenses</span>
                        <span className="text-red-600">({formatCurrency(operatingExpensesTotal)})</span>
                    </div>
                </div>

                {/* Net Profit/Loss */}
                <div className="mt-8">
                    <div className={`flex justify-between items-center p-6 border-4 border-double rounded-xl ${netProfit >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                        <span className="text-xl font-bold uppercase tracking-widest text-slate-900">
                            {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        </span>
                        <span className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            ${formatCurrency(Math.abs(netProfit))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;

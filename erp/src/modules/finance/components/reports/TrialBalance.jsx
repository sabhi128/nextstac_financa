import React from 'react';
import { calculateAccountBalance } from '../../../../utils/accountingCalculations';

/**
 * TRIAL BALANCE
 * 
 * Purpose: Verify that total debits equal total credits (double-entry validation)
 */

const TrialBalance = ({ transactions, accounts }) => {
    // Calculate balances for all accounts
    const accountBalances = accounts.map(account => {
        const { balance, balanceAmount, balanceType, normalBalance } =
            calculateAccountBalance(account, transactions);

        return {
            ...account,
            balance, // Raw balance (can be negative)
            balanceAmount, // Absolute value
            balanceType, // 'Debit' or 'Credit' based on actual balance
            normalBalance, // Expected normal balance
            isAbnormal: (normalBalance === 'Debit' && balance < 0) ||
                (normalBalance === 'Credit' && balance > 0)
        };
    }).filter(acc => acc.balanceAmount > 0); // Only show accounts with non-zero balance

    // Calculate totals
    const totalDebits = accountBalances
        .filter(a => a.balanceType === 'Debit')
        .reduce((sum, a) => sum + a.balanceAmount, 0);

    const totalCredits = accountBalances
        .filter(a => a.balanceType === 'Credit')
        .reduce((sum, a) => sum + a.balanceAmount, 0);

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
    const difference = totalDebits - totalCredits;

    // Format currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    // Group accounts with metadata for headers
    const groups = [
        { type: 'Asset', label: 'ASSET ACCOUNTS', sub: '(NORMAL: DEBIT)' },
        { type: 'Liability', label: 'LIABILITY ACCOUNTS', sub: '(NORMAL: CREDIT)' },
        { type: 'Equity', label: 'EQUITY ACCOUNTS', sub: '(NORMAL: CREDIT)' },
        { type: 'Revenue', label: 'REVENUE ACCOUNTS', sub: '(NORMAL: CREDIT)' },
        { type: 'Expense', label: 'EXPENSE ACCOUNTS', sub: '(NORMAL: DEBIT)' },
    ];

    return (
        <div className="max-w-[1000px] mx-auto bg-white shadow-2xl rounded-sm print:shadow-none min-h-[1000px] flex flex-col">
            {/* Header */}
            <div className="p-12 pb-6 text-center relative">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-3">Trial Balance</h1>
                <div className="w-24 h-1.5 bg-slate-900 mx-auto mb-4"></div>
                <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">As of {new Date().toLocaleDateString()}</p>

                <div className={`absolute top-12 right-12 px-4 py-1.5 rounded-full text-xs font-bold border-2 tracking-widest uppercase ${isBalanced
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                    : 'bg-rose-50 text-rose-700 border-rose-500'
                    }`}>
                    {isBalanced ? '● Balanced' : '● Unbalanced'}
                </div>
            </div>

            {/* Table */}
            <div className="px-12 py-8 flex-1">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-4 border-slate-900">
                            <th className="text-left py-4 font-black text-slate-700 text-xs uppercase tracking-[0.2em] w-1/2">Account Title</th>
                            <th className="text-right py-4 font-black text-slate-700 text-xs uppercase tracking-[0.2em] w-1/4">Debit</th>
                            <th className="text-right py-4 font-black text-slate-700 text-xs uppercase tracking-[0.2em] w-1/4">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {groups.map((group) => {
                            const groupAccounts = accountBalances.filter(a => a.type === group.type);
                            if (groupAccounts.length === 0) return null;

                            return (
                                <React.Fragment key={group.type}>
                                    {/* Group Header */}
                                    <tr className="bg-slate-50/50">
                                        <td colSpan={3} className="pt-8 pb-3 px-2 font-bold text-slate-500 text-[10px] uppercase tracking-widest">
                                            {group.label} <span className="opacity-60 font-normal ml-1">{group.sub}</span>
                                        </td>
                                    </tr>

                                    {/* Rows */}
                                    {groupAccounts.map((account) => (
                                        <tr key={account.id} className={`group transition-colors ${account.isAbnormal ? 'bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-400' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                                            <td className="py-3 pl-2 text-slate-800 font-bold text-sm">
                                                {account.name}
                                                {account.isAbnormal && (
                                                    <span className="ml-2 text-[10px] text-amber-600 font-normal italic lowercase">
                                                        (abnormal balance)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right font-mono font-medium text-slate-700 text-sm">
                                                {account.balanceType === 'Debit' ? formatCurrency(account.balanceAmount) : ''}
                                            </td>
                                            <td className="py-3 text-right font-mono font-medium text-slate-700 text-sm">
                                                {account.balanceType === 'Credit' ? formatCurrency(account.balanceAmount) : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr><td colSpan={3} className="py-6"></td></tr>
                        <tr className="text-lg">
                            <td className="py-4 font-black text-slate-900 uppercase tracking-widest text-sm">Total</td>
                            <td className="py-4 text-right font-bold font-mono text-slate-900 border-t-2 border-slate-900 border-b-4 border-double">
                                ${formatCurrency(totalDebits)}
                            </td>
                            <td className="py-4 text-right font-bold font-mono text-slate-900 border-t-2 border-slate-900 border-b-4 border-double">
                                ${formatCurrency(totalCredits)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Validation Footer */}
            <div className="p-12 pt-0 space-y-4">
                <div className="border-2 border-slate-900 rounded-lg p-6 bg-slate-50">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2">Double-Entry Validation:</h4>
                    <p className="text-sm text-slate-600 font-medium mb-3">
                        Total Debits (${formatCurrency(totalDebits)}) = Total Credits (${formatCurrency(totalCredits)})
                    </p>
                    {isBalanced ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                            <span className="text-lg">✓</span> Books are in balance. Every debit has a corresponding credit.
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wide">
                            <span className="text-lg">⚠</span> VARIANCE DETECTED: ${formatCurrency(Math.abs(difference))}
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                        <span className="font-bold uppercase tracking-wider mr-1">Note:</span>
                        Accounts highlighted in yellow have abnormal balances (e.g., an Asset showing a Credit balance or Revenue showing a Debit balance).
                    </p>
                    <p className="text-[9px] text-amber-600/60 text-right mt-1 font-mono uppercase tracking-widest">
                        Generated by Office Ledger Pro • Financial Reporting Module
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrialBalance;

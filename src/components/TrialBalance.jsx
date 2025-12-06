import React from 'react';
import { calculateAccountBalance } from '../utils/accountingCalculations';

/**
 * TRIAL BALANCE
 * 
 * Purpose: Verify that total debits equal total credits (double-entry validation)
 * 
 * The Trial Balance lists ALL accounts with balances and shows:
 * - Accounts with DEBIT balances in the Debit column
 * - Accounts with CREDIT balances in the Credit column
 * 
 * If Total Debits ≠ Total Credits, there's an error in the books
 * 
 * Note: The Trial Balance shows the ACTUAL balance side, not the normal balance.
 * For example, if an Asset account has more credits than debits (unusual),
 * it would show in the Credit column.
 */

const TrialBalance = ({ transactions, accounts }) => {
    // Calculate balances for all accounts
    // balance = debitTotal - creditTotal
    // If balance > 0: Debit balance
    // If balance < 0: Credit balance (show absolute value in credit column)
    const accountBalances = accounts.map(account => {
        const { debitTotal, creditTotal, balance, balanceAmount, balanceType, normalBalance } = 
            calculateAccountBalance(account, transactions);
        
        return {
            ...account,
            debitTotal,
            creditTotal,
            balance, // Raw balance (can be negative)
            balanceAmount, // Absolute value
            balanceType, // 'Debit' or 'Credit' based on actual balance
            normalBalance, // Expected normal balance
            isAbnormal: (normalBalance === 'Debit' && balance < 0) || 
                       (normalBalance === 'Credit' && balance > 0)
        };
    }).filter(acc => acc.balanceAmount > 0); // Only show accounts with non-zero balance

    // Calculate totals
    // Debit column: Sum of all accounts where balance > 0
    // Credit column: Sum of all accounts where balance < 0 (as positive numbers)
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

    // Group accounts by type for better organization
    const groupedAccounts = {
        'Asset': accountBalances.filter(a => a.type === 'Asset'),
        'Liability': accountBalances.filter(a => a.type === 'Liability'),
        'Equity': accountBalances.filter(a => a.type === 'Equity'),
        'Revenue': accountBalances.filter(a => a.type === 'Revenue'),
        'Expense': accountBalances.filter(a => a.type === 'Expense'),
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 min-h-[800px] p-12 relative">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">Trial Balance</h2>
                <p className="text-gray-500 font-mono text-sm">As of {new Date().toLocaleDateString()}</p>
                <div className="w-24 h-1 bg-gray-900 mx-auto mt-6"></div>
            </div>

            {/* Validation Badge */}
            <div className={`absolute top-12 right-12 px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${isBalanced
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                <span className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {isBalanced ? 'BALANCED' : `UNBALANCED (${formatCurrency(Math.abs(difference))})`}
            </div>

            {/* Table */}
            <div className="relative">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-4 font-bold text-gray-900 uppercase tracking-wider w-1/2">
                                Account Title
                            </th>
                            <th className="text-right py-4 font-bold text-gray-900 uppercase tracking-wider w-1/4">
                                Debit
                            </th>
                            <th className="text-right py-4 font-bold text-gray-900 uppercase tracking-wider w-1/4">
                                Credit
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Render accounts grouped by type */}
                        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
                            if (typeAccounts.length === 0) return null;
                            return (
                                <React.Fragment key={type}>
                                    {/* Type Header */}
                                    <tr className="bg-gray-50">
                                        <td colSpan={3} className="py-2 px-2 font-bold text-gray-700 text-sm uppercase tracking-wider">
                                            {type} Accounts
                                            <span className="text-xs font-normal text-gray-500 ml-2">
                                                (Normal: {type === 'Asset' || type === 'Expense' ? 'Debit' : 'Credit'})
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Account Rows */}
                                    {typeAccounts.map((account) => (
                                        <tr 
                                            key={account.id} 
                                            className={`group hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                                account.isAbnormal ? 'bg-yellow-50' : ''
                                            }`}
                                        >
                                            <td className="py-3 text-gray-700 font-medium group-hover:text-gray-900 pl-4">
                                                {account.name}
                                                {account.isAbnormal && (
                                                    <span className="ml-2 text-xs text-yellow-600 font-normal">
                                                        (abnormal balance)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-600">
                                                {account.balanceType === 'Debit' 
                                                    ? formatCurrency(account.balanceAmount) 
                                                    : ''}
                                            </td>
                                            <td className="py-3 text-right font-mono text-gray-600">
                                                {account.balanceType === 'Credit' 
                                                    ? formatCurrency(account.balanceAmount) 
                                                    : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}

                        {/* Empty state */}
                        {accountBalances.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-400">
                                    No transactions recorded yet
                                </td>
                            </tr>
                        )}

                        {/* Spacer rows for paper feel */}
                        {accountBalances.length > 0 && [...Array(3)].map((_, i) => (
                            <tr key={`empty-${i}`} className="h-8">
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-900">
                            <td className="py-4 font-bold text-gray-900 uppercase tracking-wider">
                                Total
                            </td>
                            <td className="py-4 text-right font-bold font-mono text-gray-900 border-b-4 border-double border-gray-900">
                                ${formatCurrency(totalDebits)}
                            </td>
                            <td className="py-4 text-right font-bold font-mono text-gray-900 border-b-4 border-double border-gray-900">
                                ${formatCurrency(totalCredits)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Explanation */}
            <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100 text-sm">
                <p className="font-bold text-primary-800 mb-2">Double-Entry Validation:</p>
                <p className="text-primary-700">
                    Total Debits (${formatCurrency(totalDebits)}) {isBalanced ? '=' : '≠'} Total Credits (${formatCurrency(totalCredits)})
                </p>
                {!isBalanced && (
                    <p className="text-red-600 mt-2">
                        ⚠️ Difference of ${formatCurrency(Math.abs(difference))} detected. Please review entries for errors.
                    </p>
                )}
                {isBalanced && (
                    <p className="text-green-600 mt-2">
                        ✓ Books are in balance. Every debit has a corresponding credit.
                    </p>
                )}
            </div>

            {/* Legend for abnormal balances */}
            {accountBalances.some(a => a.isAbnormal) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                    <span className="font-bold">Note:</span> Accounts highlighted in yellow have abnormal balances 
                    (e.g., an Asset showing a Credit balance or Revenue showing a Debit balance).
                </div>
            )}

            {/* Footer Note */}
            <div className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-400 font-mono">
                Generated by Office Ledger Pro • Financial Reporting Module
            </div>
        </div>
    );
};

export default TrialBalance;

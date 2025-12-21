import React from 'react';
import { calculateAccountBalance, calculateNetProfit } from '../../../../utils/accountingCalculations';

const BalanceSheet = ({ transactions, accounts }) => {

    // Helper helpers
    const getAssetBalance = (account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        return debitTotal - creditTotal;
    };

    const getLiabilityBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return creditTotal - debitTotal;
    };

    const getEquityBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        if (account.name === 'Drawings') {
            return debitTotal - creditTotal;
        }
        return creditTotal - debitTotal;
    };

    // Assets
    const assetAccounts = accounts.filter(a => a.type === 'Asset');
    const totalAssets = assetAccounts.reduce((sum, account) => sum + getAssetBalance(account), 0);

    // Liabilities
    const liabilityAccounts = accounts.filter(a => a.type === 'Liability');
    const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + getLiabilityBalance(account), 0);

    // Equity
    const capitalAccounts = accounts.filter(a => a.type === 'Equity' && a.name !== 'Drawings');
    const totalCapital = capitalAccounts.reduce((sum, account) => sum + getEquityBalance(account), 0);

    const drawingsAccount = accounts.find(a => a.name === 'Drawings');
    const drawingsBalance = drawingsAccount ? getEquityBalance(drawingsAccount) : 0;

    const netProfit = calculateNetProfit(accounts, transactions);
    const totalEquity = totalCapital + netProfit - drawingsBalance;

    // Validation
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;
    const difference = totalAssets - totalLiabilitiesAndEquity;

    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 text-center">
                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-2">Balance Sheet</h2>
                <p className="text-slate-500 font-mono text-sm">As of {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex justify-center mt-6 mb-2">
                <div className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${isBalanced
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {isBalanced ? 'BALANCED' : `UNBALANCED (${formatCurrency(difference)})`}
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-slate-800">

                {/* ASSETS */}
                <div>
                    <h3 className="font-bold text-slate-900 uppercase mb-4 border-b-2 border-slate-900 pb-2">
                        Assets
                        <span className="text-xs text-slate-500 font-normal ml-2 lowercase">(Debit Normal)</span>
                    </h3>
                    <div className="space-y-2">
                        {assetAccounts.map(account => {
                            const balance = getAssetBalance(account);
                            if (balance === 0) return null;
                            return (
                                <div key={account.id} className="flex justify-between py-1 hover:bg-slate-50 pl-2 rounded transition-colors">
                                    <span>{account.name}</span>
                                    <span>{formatCurrency(balance)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between py-4 font-bold border-t-2 border-slate-900 mt-8 text-lg bg-blue-50 px-3 rounded-lg text-blue-900">
                        <span>Total Assets</span>
                        <span>${formatCurrency(totalAssets)}</span>
                    </div>
                </div>

                {/* LIABILITIES & EQUITY */}
                <div>
                    <div className="mb-12">
                        <h3 className="font-bold text-slate-900 uppercase mb-4 border-b-2 border-slate-900 pb-2">
                            Liabilities
                            <span className="text-xs text-slate-500 font-normal ml-2 lowercase">(Credit Normal)</span>
                        </h3>
                        <div className="space-y-2">
                            {liabilityAccounts.map(account => {
                                const balance = getLiabilityBalance(account);
                                if (balance === 0) return null;
                                return (
                                    <div key={account.id} className="flex justify-between py-1 hover:bg-slate-50 pl-2 rounded transition-colors">
                                        <span>{account.name}</span>
                                        <span>{formatCurrency(balance)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between py-2 font-bold border-t border-slate-300 mt-4">
                            <span>Total Liabilities</span>
                            <span>${formatCurrency(totalLiabilities)}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 uppercase mb-4 border-b-2 border-slate-900 pb-2">
                            Owner's Equity
                        </h3>
                        <div className="space-y-2">
                            {capitalAccounts.map(account => {
                                const balance = getEquityBalance(account);
                                if (balance === 0) return null;
                                return (
                                    <div key={account.id} className="flex justify-between py-1 pl-2">
                                        <span>{account.name}</span>
                                        <span>{formatCurrency(balance)}</span>
                                    </div>
                                );
                            })}

                            <div className={`flex justify-between py-1 pl-2 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                <span>Add: Net {netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                                <span>{netProfit >= 0 ? '' : '('}{formatCurrency(Math.abs(netProfit))}{netProfit >= 0 ? '' : ')'}</span>
                            </div>

                            {drawingsBalance > 0 && (
                                <div className="flex justify-between py-1 text-red-700 pl-2">
                                    <span>Less: Drawings</span>
                                    <span>({formatCurrency(drawingsBalance)})</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between py-2 font-bold border-t border-slate-300 mt-4">
                            <span>Total Equity</span>
                            <span>${formatCurrency(totalEquity)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between py-4 font-bold border-t-2 border-slate-900 mt-8 text-lg bg-blue-50 px-3 rounded-lg text-blue-900">
                        <span>Total Liab. & Equity</span>
                        <span>${formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;

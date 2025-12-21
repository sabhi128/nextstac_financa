import React from 'react';
import { CreditCard, Wallet, Building2, Coins, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

const LedgerDashboard = ({ onAccountClick, accounts }) => {

    // Group accounts
    const accountGroups = {
        Asset: accounts.filter(a => a.type === 'Asset'),
        Liability: accounts.filter(a => a.type === 'Liability'),
        Equity: accounts.filter(a => a.type === 'Equity'),
        Revenue: accounts.filter(a => a.type === 'Revenue'),
        Expense: accounts.filter(a => a.type === 'Expense'),
    };

    // Design Tokens based on Account Type
    const getGroupConfig = (type) => {
        switch (type) {
            case 'Asset': return {
                color: 'bg-blue-600',
                border: 'border-blue-200',
                badgeText: 'DEBIT',
                icon: Wallet
            };
            case 'Liability': return {
                color: 'bg-red-600',
                border: 'border-red-200',
                badgeText: 'CREDIT',
                icon: CreditCard
            };
            case 'Equity': return {
                color: 'bg-purple-600',
                border: 'border-purple-200',
                badgeText: 'CREDIT',
                icon: Building2
            };
            case 'Revenue': return {
                color: 'bg-emerald-600',
                border: 'border-emerald-200',
                badgeText: 'CREDIT',
                icon: TrendingUp
            };
            case 'Expense': return {
                color: 'bg-amber-600',
                border: 'border-amber-200',
                badgeText: 'DEBIT',
                icon: TrendingDown
            };
            default: return {
                color: 'bg-slate-600',
                border: 'border-slate-200',
                badgeText: '---',
                icon: Coins
            };
        }
    };

    return (
        <div className="space-y-12 pb-12">
            {Object.entries(accountGroups).map(([type, groupAccounts]) => {
                if (groupAccounts.length === 0) return null;
                const config = getGroupConfig(type);
                const Icon = config.icon;

                return (
                    <div key={type} className="space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-6 rounded-full ${config.color}`}></div>
                            <h3 className="text-lg font-bold text-slate-900">{type} Accounts</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm">
                                {groupAccounts.length}
                            </span>
                        </div>

                        {/* Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {groupAccounts.map(account => (
                                <div
                                    key={account.id}
                                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
                                    onClick={() => onAccountClick(account)}
                                >
                                    {/* Debit/Credit Indicator */}
                                    <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        {config.badgeText}
                                    </div>

                                    {/* Icon */}
                                    <div className="mb-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <Icon className="w-6 h-6 stroke-1" />
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">{account.name}</h4>
                                        <p className="text-xs text-slate-400 font-mono">ID: #{account.id.substring(0, 8)}</p>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-600">View Ledger</span>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LedgerDashboard;

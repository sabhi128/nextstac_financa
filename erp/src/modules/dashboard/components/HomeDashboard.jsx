import React, { useMemo } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { calculateAccountBalance } from '../../../utils/accountingCalculations';

const HomeDashboard = ({ accounts, transactions, loading }) => {
    // Calculate Financial Data
    const financialData = useMemo(() => {
        if (loading || !accounts || accounts.length === 0) return null;

        // Helper to get total balance for a group of accounts
        const getGroupTotal = (type) => {
            return accounts
                .filter(a => a.type === type)
                .reduce((sum, account) => {
                    const { balanceAmount } = calculateAccountBalance(account, transactions);
                    return sum + balanceAmount;
                }, 0);
        };

        const totalAssets = getGroupTotal('Asset');
        const totalLiabilities = getGroupTotal('Liability');
        const totalRevenue = getGroupTotal('Revenue');
        const totalExpenses = getGroupTotal('Expense');

        const getSignedBalance = (account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
            if (account.type === 'Asset' || account.type === 'Expense') {
                return debitTotal - creditTotal;
            } else {
                return creditTotal - debitTotal;
            }
        };

        const totalEquityAccounts = accounts
            .filter(a => a.type === 'Equity')
            .reduce((sum, account) => sum + getSignedBalance(account), 0);

        const netProfit = totalRevenue - totalExpenses;
        const totalEquity = totalEquityAccounts + netProfit;

        const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

        return {
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalRevenue,
            totalExpenses,
            netProfit,
            isBalanced
        };
    }, [accounts, transactions, loading]);

    // Chart Data: Revenue vs Expenses Over Time
    const trendChartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Group transactions by month
        const monthlyData = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, revenue: 0, expenses: 0 };
            }

            // Get account types
            // Handle both structure patterns (direct ID or object)
            const debitAccountId = transaction.debit_account_id || transaction.debitAccount?.id;
            const creditAccountId = transaction.credit_account_id || transaction.creditAccount?.id;

            const debitAccount = accounts?.find(a => a.id === debitAccountId);
            const creditAccount = accounts?.find(a => a.id === creditAccountId);

            const amount = parseFloat(transaction.amount);

            if (debitAccount?.type === 'Expense') {
                monthlyData[monthKey].expenses += amount;
            }
            if (creditAccount?.type === 'Revenue') {
                monthlyData[monthKey].revenue += amount;
            }
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(item => ({
                month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                Revenue: Math.round(item.revenue),
                Expenses: Math.round(item.expenses)
            }));
    }, [transactions, accounts]);

    // Chart Data: Expense Breakdown by Account
    const expenseBreakdownData = useMemo(() => {
        if (!accounts || !transactions) return [];

        const expenseAccounts = accounts.filter(a => a.type === 'Expense');

        return expenseAccounts
            .map(account => {
                const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
                const balance = debitTotal - creditTotal;
                return {
                    name: account.name,
                    value: Math.round(balance)
                };
            })
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 expenses
    }, [accounts, transactions]);

    // Recent Transactions
    const recentTransactions = transactions ? [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5) : [];

    // Chart Colors
    const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16'];

    // Skeleton Loader
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Top Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
                    ))}
                </div>
                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-200 rounded-2xl"></div>
                    <div className="h-80 bg-gray-200 rounded-2xl"></div>
                </div>
                {/* Performance Section Skeleton */}
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                {/* Bottom Section Skeleton */}
                <div className="h-80 bg-gray-200 rounded-2xl"></div>
            </div>
        );
    }

    if (!financialData) return <div className="p-8 text-center text-slate-500">No financial data available.</div>;

    const { totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses, netProfit, isBalanced } = financialData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Accounting Equation Cards */}
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Assets */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Assets</h3>
                        <p className="text-3xl font-bold text-slate-900">
                            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            <span>Asset Value</span>
                        </div>
                    </div>

                    {/* Liabilities */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Liabilities</h3>
                        <p className="text-3xl font-bold text-slate-900">
                            ${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="mt-4 flex items-center text-red-500 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                            <span>Outstanding Debt</span>
                        </div>
                    </div>

                    {/* Equity */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Owner's Equity</h3>
                        <p className="text-3xl font-bold text-slate-900">
                            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                            <span>Net Value</span>
                        </div>
                    </div>
                </div>

                {/* Balance Badge */}
                {isBalanced && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-1">
                        <span>⚖️</span>
                        Equation Balanced
                    </div>
                )}
            </div>

            {/* 2. Financial Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        Trend Analysis
                    </h3>
                    {trendChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                                <YAxis stroke="#64748B" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-400">
                            No transaction data available
                        </div>
                    )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        Top Expense Categories
                    </h3>
                    {expenseBreakdownData.length > 0 ? (
                        <div className="flex items-center justify-between gap-8">
                            <ResponsiveContainer width="50%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {expenseBreakdownData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-sm text-slate-600 font-medium truncate">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">${item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-400">
                            No expense data available
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Performance Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    Performance Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            +${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-500">
                            -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Profit</p>
                        <p className={`text-4xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Recent Activity Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Recent Journal Entries
                    </h3>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-all active:scale-95">
                        View All
                    </button>
                </div>
                <div className="divide-y divide-slate-50">
                    {recentTransactions.map(transaction => (
                        <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                    {new Date(transaction.date).getDate()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{transaction.description}</p>
                                    <p className="text-xs text-slate-500">
                                        {transaction.debitAccount?.name}
                                        <span className="mx-1 text-slate-300">→</span>
                                        {transaction.creditAccount?.name}
                                    </p>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                                ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}
                    {recentTransactions.length === 0 && (
                        <div className="p-8 text-center text-slate-400">No recent transactions</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;

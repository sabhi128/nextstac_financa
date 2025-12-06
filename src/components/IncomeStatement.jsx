import { calculateAccountBalance, calculateNetProfit } from '../utils/accountingCalculations';

/**
 * INCOME STATEMENT (Profit & Loss Statement)
 * 
 * Purpose: Shows the company's financial performance over a period of time
 * 
 * Structure:
 * Revenue (Credit balance accounts - shown as positive)
 * - Cost of Goods Sold (if applicable)
 * = Gross Profit
 * - Operating Expenses
 * = Net Profit (or Net Loss)
 * 
 * Accounting Principle: Revenue - Expenses = Net Income
 */

const IncomeStatement = ({ transactions, accounts }) => {
    
    // Get the proper balance for revenue accounts (credit-normal)
    // Revenue increases with credits, so balance = Credits - Debits
    const getRevenueBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return creditTotal - debitTotal; // Positive when revenue is earned
    };

    // Get the proper balance for expense accounts (debit-normal)
    // Expenses increase with debits, so balance = Debits - Credits
    const getExpenseBalance = (account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        return debitTotal - creditTotal; // Positive when expenses are incurred
    };

    // Revenue accounts
    const revenueAccounts = accounts.filter(a => a.type === 'Revenue');
    const totalRevenue = revenueAccounts.reduce((sum, account) => {
        return sum + getRevenueBalance(account);
    }, 0);

    // Cost of Goods Sold (COGS) - specific expense account
    const cogsAccounts = accounts.filter(a => a.name === 'Cost of Goods Sold');
    const cogsTotal = cogsAccounts.reduce((sum, account) => {
        return sum + getExpenseBalance(account);
    }, 0);

    // Gross Profit = Revenue - COGS
    const grossProfit = totalRevenue - cogsTotal;

    // Operating Expenses (all expenses except COGS)
    const operatingExpenseAccounts = accounts.filter(a => 
        a.type === 'Expense' && a.name !== 'Cost of Goods Sold'
    );
    const operatingExpensesTotal = operatingExpenseAccounts.reduce((sum, account) => {
        return sum + getExpenseBalance(account);
    }, 0);

    // Net Profit = Gross Profit - Operating Expenses
    // Or: Net Profit = Total Revenue - Total Expenses (COGS + Operating)
    const netProfit = grossProfit - operatingExpensesTotal;

    // Format currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 min-h-[800px] p-12 relative">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">Income Statement</h2>
                <p className="text-gray-500 font-mono text-sm">For the Period Ended {new Date().toLocaleDateString()}</p>
                <div className="w-24 h-1 bg-gray-900 mx-auto mt-6"></div>
            </div>

            {/* Content */}
            <div className="space-y-8 font-mono text-gray-800">

                {/* Revenue Section */}
                <div>
                    <h3 className="font-bold text-gray-900 uppercase mb-4 border-b border-gray-300 pb-2">Revenue</h3>
                    {revenueAccounts.map(account => {
                        const balance = getRevenueBalance(account);
                        if (balance === 0) return null;
                        return (
                            <div key={account.id} className="flex justify-between py-2 hover:bg-gray-50 pl-4">
                                <span>{account.name}</span>
                                <span className="text-green-700">{formatCurrency(balance)}</span>
                            </div>
                        );
                    })}
                    <div className="flex justify-between py-2 font-bold border-t border-gray-900 mt-2">
                        <span>Total Revenue</span>
                        <span className="text-green-700">${formatCurrency(totalRevenue)}</span>
                    </div>
                </div>

                {/* Cost of Goods Sold */}
                {cogsAccounts.length > 0 && (
                    <div>
                        <h3 className="font-bold text-gray-900 uppercase mb-4 border-b border-gray-300 pb-2">Cost of Sales</h3>
                        {cogsAccounts.map(account => {
                            const balance = getExpenseBalance(account);
                            if (balance === 0) return null;
                            return (
                                <div key={account.id} className="flex justify-between py-2 hover:bg-gray-50 pl-4">
                                    <span>{account.name}</span>
                                    <span className="text-red-600">({formatCurrency(balance)})</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between py-2 font-bold border-t border-gray-900 mt-2">
                            <span>Total Cost of Goods Sold</span>
                            <span className="text-red-600">({formatCurrency(cogsTotal)})</span>
                        </div>
                    </div>
                )}

                {/* Gross Profit */}
                <div className="flex justify-between py-4 font-bold text-lg bg-gray-50 px-4 border-y-2 border-gray-200">
                    <span>Gross Profit</span>
                    <span className={grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                        ${formatCurrency(grossProfit)}
                    </span>
                </div>

                {/* Operating Expenses */}
                <div>
                    <h3 className="font-bold text-gray-900 uppercase mb-4 border-b border-gray-300 pb-2">Operating Expenses</h3>
                    {operatingExpenseAccounts.map(account => {
                        const balance = getExpenseBalance(account);
                        if (balance === 0) return null;
                        return (
                            <div key={account.id} className="flex justify-between py-2 hover:bg-gray-50 pl-4">
                                <span>{account.name}</span>
                                <span className="text-red-600">({formatCurrency(balance)})</span>
                            </div>
                        );
                    })}
                    <div className="flex justify-between py-2 font-bold border-t border-gray-900 mt-2">
                        <span>Total Operating Expenses</span>
                        <span className="text-red-600">({formatCurrency(operatingExpensesTotal)})</span>
                    </div>
                </div>

                {/* Net Profit/Loss */}
                <div className="mt-12">
                    <div className={`flex justify-between items-center p-6 border-4 border-double ${netProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <span className="text-xl font-bold uppercase tracking-widest text-gray-900">
                            {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        </span>
                        <span className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            ${formatCurrency(Math.abs(netProfit))}
                        </span>
                    </div>
                </div>

                {/* Summary Formula */}
                <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100 text-sm text-primary-600">
                    <p className="font-bold mb-2">Income Statement Formula:</p>
                    <p className="font-mono">
                        Revenue (${formatCurrency(totalRevenue)}) - COGS (${formatCurrency(cogsTotal)}) = Gross Profit (${formatCurrency(grossProfit)})
                    </p>
                    <p className="font-mono">
                        Gross Profit (${formatCurrency(grossProfit)}) - Operating Expenses (${formatCurrency(operatingExpensesTotal)}) = Net {netProfit >= 0 ? 'Profit' : 'Loss'} (${formatCurrency(Math.abs(netProfit))})
                    </p>
                </div>
            </div>

            {/* Footer Note */}
            <div className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-400 font-mono">
                Generated by Office Ledger Pro • Financial Reporting Module
            </div>
        </div>
    );
};

export default IncomeStatement;

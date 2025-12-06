import { calculateAccountBalance, calculateNetProfit } from '../utils/accountingCalculations';

/**
 * BALANCE SHEET (Statement of Financial Position)
 * 
 * Purpose: Shows the company's financial position at a specific point in time
 * 
 * The Accounting Equation:
 * ASSETS = LIABILITIES + OWNER'S EQUITY
 * 
 * Where Owner's Equity = Capital + Net Profit - Drawings
 * 
 * Normal Balance Rules:
 * - Assets: DEBIT balance (positive when Debits > Credits)
 * - Liabilities: CREDIT balance (positive when Credits > Debits)  
 * - Equity: CREDIT balance (positive when Credits > Debits)
 * - Drawings: DEBIT balance (contra-equity, reduces equity)
 */

const BalanceSheet = ({ transactions, accounts }) => {
    
    // Get proper balance for ASSET accounts (debit-normal)
    // Assets increase with debits: Balance = Debits - Credits
    const getAssetBalance = (account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        return debitTotal - creditTotal;
    };

    // Get proper balance for LIABILITY accounts (credit-normal)
    // Liabilities increase with credits: Balance = Credits - Debits
    const getLiabilityBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return creditTotal - debitTotal;
    };

    // Get proper balance for EQUITY accounts (credit-normal, except Drawings)
    // Equity increases with credits: Balance = Credits - Debits
    const getEquityBalance = (account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        // Drawings is a contra-equity account (debit-normal)
        if (account.name === 'Drawings') {
            return debitTotal - creditTotal; // Returns positive when there are drawings
        }
        return creditTotal - debitTotal;
    };

    // ============ ASSETS ============
    const assetAccounts = accounts.filter(a => a.type === 'Asset');
    const totalAssets = assetAccounts.reduce((sum, account) => {
        return sum + getAssetBalance(account);
    }, 0);

    // ============ LIABILITIES ============
    const liabilityAccounts = accounts.filter(a => a.type === 'Liability');
    const totalLiabilities = liabilityAccounts.reduce((sum, account) => {
        return sum + getLiabilityBalance(account);
    }, 0);

    // ============ OWNER'S EQUITY ============
    // Capital account(s)
    const capitalAccounts = accounts.filter(a => a.type === 'Equity' && a.name !== 'Drawings');
    const totalCapital = capitalAccounts.reduce((sum, account) => {
        return sum + getEquityBalance(account);
    }, 0);

    // Drawings (contra-equity - reduces equity)
    const drawingsAccount = accounts.find(a => a.name === 'Drawings');
    const drawingsBalance = drawingsAccount ? getEquityBalance(drawingsAccount) : 0;

    // Net Profit from Income Statement
    const netProfit = calculateNetProfit(accounts, transactions);

    // Total Equity = Capital + Net Profit - Drawings
    const totalEquity = totalCapital + netProfit - drawingsBalance;

    // ============ VALIDATION ============
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;
    const difference = totalAssets - totalLiabilitiesAndEquity;

    // Format currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 min-h-[800px] p-12 relative">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">Balance Sheet</h2>
                <p className="text-gray-500 font-mono text-sm">As of {new Date().toLocaleDateString()}</p>
                <div className="w-24 h-1 bg-gray-900 mx-auto mt-6"></div>
            </div>

            {/* Validation Badge */}
            <div className={`absolute top-12 right-12 px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${isBalanced
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                <span className={`w-2 h-2 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {isBalanced ? 'BALANCED' : `UNBALANCED (${formatCurrency(difference)})`}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-gray-800">

                {/* Left Column: ASSETS */}
                <div>
                    <h3 className="font-bold text-gray-900 uppercase mb-4 border-b-2 border-gray-900 pb-2">
                        Assets
                        <span className="text-xs text-gray-500 font-normal ml-2">(Debit Balance)</span>
                    </h3>
                    <div className="space-y-2">
                        {assetAccounts.map(account => {
                            const balance = getAssetBalance(account);
                            if (balance === 0) return null;
                            return (
                                <div key={account.id} className="flex justify-between py-1 hover:bg-gray-50 pl-2">
                                    <span>{account.name}</span>
                                    <span>{formatCurrency(balance)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between py-4 font-bold border-t-2 border-gray-900 mt-8 text-lg bg-blue-50 px-2 rounded">
                        <span>Total Assets</span>
                        <span>${formatCurrency(totalAssets)}</span>
                    </div>
                </div>

                {/* Right Column: LIABILITIES & EQUITY */}
                <div>
                    {/* Liabilities Section */}
                    <div className="mb-12">
                        <h3 className="font-bold text-gray-900 uppercase mb-4 border-b-2 border-gray-900 pb-2">
                            Liabilities
                            <span className="text-xs text-gray-500 font-normal ml-2">(Credit Balance)</span>
                        </h3>
                        <div className="space-y-2">
                            {liabilityAccounts.map(account => {
                                const balance = getLiabilityBalance(account);
                                if (balance === 0) return null;
                                return (
                                    <div key={account.id} className="flex justify-between py-1 hover:bg-gray-50 pl-2">
                                        <span>{account.name}</span>
                                        <span>{formatCurrency(balance)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-4">
                            <span>Total Liabilities</span>
                            <span>${formatCurrency(totalLiabilities)}</span>
                        </div>
                    </div>

                    {/* Equity Section */}
                    <div>
                        <h3 className="font-bold text-gray-900 uppercase mb-4 border-b-2 border-gray-900 pb-2">
                            Owner's Equity
                            <span className="text-xs text-gray-500 font-normal ml-2">(Credit Balance)</span>
                        </h3>
                        <div className="space-y-2">
                            {/* Capital Accounts */}
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
                            
                            {/* Net Profit (from Income Statement) */}
                            <div className={`flex justify-between py-1 pl-2 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                <span>Add: Net {netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                                <span>{netProfit >= 0 ? '' : '('}{formatCurrency(Math.abs(netProfit))}{netProfit >= 0 ? '' : ')'}</span>
                            </div>
                            
                            {/* Drawings (Contra-Equity) */}
                            {drawingsBalance > 0 && (
                                <div className="flex justify-between py-1 text-red-700 pl-2">
                                    <span>Less: Drawings</span>
                                    <span>({formatCurrency(drawingsBalance)})</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-4">
                            <span>Total Equity</span>
                            <span>${formatCurrency(totalEquity)}</span>
                        </div>
                    </div>

                    {/* Total Liabilities & Equity */}
                    <div className="flex justify-between py-4 font-bold border-t-2 border-gray-900 mt-8 text-lg bg-blue-50 px-2 rounded">
                        <span>Total Liab. & Equity</span>
                        <span>${formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                </div>
            </div>

            {/* Accounting Equation Summary */}
            <div className="mt-12 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <p className="font-bold text-primary-800 mb-2">The Accounting Equation:</p>
                <div className="font-mono text-sm text-primary-700 space-y-1">
                    <p>
                        <span className="font-bold">Assets</span> = <span className="font-bold">Liabilities</span> + <span className="font-bold">Owner's Equity</span>
                    </p>
                    <p>
                        ${formatCurrency(totalAssets)} = ${formatCurrency(totalLiabilities)} + ${formatCurrency(totalEquity)}
                    </p>
                    <p>
                        ${formatCurrency(totalAssets)} = ${formatCurrency(totalLiabilitiesAndEquity)} 
                        <span className={`ml-2 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            {isBalanced ? '✓ Balanced' : `✗ Difference: ${formatCurrency(difference)}`}
                        </span>
                    </p>
                </div>
                <div className="mt-3 pt-3 border-t border-primary-200 text-xs text-primary-600">
                    <p><strong>Equity Breakdown:</strong></p>
                    <p className="font-mono">
                        Capital (${formatCurrency(totalCapital)}) + Net Profit (${formatCurrency(netProfit)}) - Drawings (${formatCurrency(drawingsBalance)}) = ${formatCurrency(totalEquity)}
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

export default BalanceSheet;

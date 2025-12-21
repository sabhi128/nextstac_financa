/**
 * ACCOUNTING CALCULATIONS
 * Following Double-Entry Bookkeeping Principles
 * 
 * Normal Balance Rules:
 * - Assets: DEBIT balance (increases with debits, decreases with credits)
 * - Expenses: DEBIT balance (increases with debits, decreases with credits)
 * - Drawings: DEBIT balance (contra-equity, increases with debits)
 * - Liabilities: CREDIT balance (increases with credits, decreases with debits)
 * - Equity: CREDIT balance (increases with credits, decreases with debits)
 * - Revenue: CREDIT balance (increases with credits, decreases with debits)
 * 
 * Accounting Equation: Assets = Liabilities + Owner's Equity
 * Expanded: Assets = Liabilities + (Capital + Revenue - Expenses - Drawings)
 */

// Determine if an account has a debit normal balance
export const isDebitNormalBalance = (accountType) => {
    return ['Asset', 'Expense'].includes(accountType);
};

// Determine if an account has a credit normal balance
export const isCreditNormalBalance = (accountType) => {
    return ['Liability', 'Equity', 'Revenue'].includes(accountType);
};

/**
 * Calculate the balance for a specific account based on all transactions
 * Returns both raw totals and the proper signed balance based on normal balance rules
 */
export const calculateAccountBalance = (account, transactions) => {
    let debitTotal = 0;
    let creditTotal = 0;

    transactions.forEach(transaction => {
        // Handle both Supabase (snake_case) and legacy (camelCase) structures
        const debitId = transaction.debit_account_id || transaction.debitAccount?.id;
        const creditId = transaction.credit_account_id || transaction.creditAccount?.id;

        if (debitId === account.id) {
            debitTotal += parseFloat(transaction.amount);
        }
        if (creditId === account.id) {
            creditTotal += parseFloat(transaction.amount);
        }
    });

    // Raw balance (Debits - Credits) - used for trial balance
    const rawBalance = debitTotal - creditTotal;

    // Determine the proper signed balance based on account type
    // For DEBIT normal accounts (Assets, Expenses): positive when debits > credits
    // For CREDIT normal accounts (Liabilities, Equity, Revenue): positive when credits > debits
    let signedBalance;
    let normalBalance;

    // Check account type or normal_balance field
    const accountType = account.type;
    const accountNormalBalance = account.normal_balance || account.normalBalance;

    if (accountNormalBalance === 'Debit' || isDebitNormalBalance(accountType)) {
        // Debit-normal account: Balance = Debits - Credits
        signedBalance = debitTotal - creditTotal;
        normalBalance = 'Debit';
    } else {
        // Credit-normal account: Balance = Credits - Debits
        signedBalance = creditTotal - debitTotal;
        normalBalance = 'Credit';
    }

    // Special case for Drawings (contra-equity) - it's debit normal
    if (account.name === 'Drawings') {
        signedBalance = debitTotal - creditTotal;
        normalBalance = 'Debit';
    }

    // Determine actual balance type based on raw balance
    // If rawBalance >= 0, account has a Debit balance
    // If rawBalance < 0, account has a Credit balance
    const actualBalanceType = rawBalance >= 0 ? 'Debit' : 'Credit';

    return {
        debitTotal,
        creditTotal,
        // Raw balance (Debits - Credits) - for trial balance
        balance: rawBalance,
        // Proper signed balance considering normal balance
        signedBalance,
        // Absolute value of balance
        balanceAmount: Math.abs(rawBalance),
        // The actual side the balance is on
        balanceType: actualBalanceType,
        // The expected/normal balance type
        normalBalance,
        // Whether the account has an abnormal balance
        isAbnormal: (normalBalance === 'Debit' && rawBalance < 0) || 
                   (normalBalance === 'Credit' && rawBalance > 0 && accountType !== 'Asset' && accountType !== 'Expense')
    };
};

/**
 * Calculate total for a group of accounts with proper sign handling
 * Used for financial statements
 */
export const calculateGroupTotal = (accounts, transactions, accountType) => {
    const filteredAccounts = accounts.filter(a => a.type === accountType);
    
    return filteredAccounts.reduce((sum, account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        
        // For debit-normal accounts (Assets, Expenses): Debits - Credits
        // For credit-normal accounts (Liabilities, Equity, Revenue): Credits - Debits
        if (isDebitNormalBalance(accountType)) {
            return sum + (debitTotal - creditTotal);
        } else {
            return sum + (creditTotal - debitTotal);
        }
    }, 0);
};

/**
 * Calculate Net Profit/Loss from Income Statement
 * Net Profit = Total Revenue - Total Expenses
 */
export const calculateNetProfit = (accounts, transactions) => {
    // Revenue accounts (credit-normal): Balance = Credits - Debits
    const revenueAccounts = accounts.filter(acc => acc.type === 'Revenue');
    const totalRevenue = revenueAccounts.reduce((sum, account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return sum + (creditTotal - debitTotal); // Revenue increases with credits
    }, 0);

    // Expense accounts (debit-normal): Balance = Debits - Credits
    const expenseAccounts = accounts.filter(acc => acc.type === 'Expense');
    const totalExpenses = expenseAccounts.reduce((sum, account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, transactions);
        return sum + (debitTotal - creditTotal); // Expenses increase with debits
    }, 0);

    return totalRevenue - totalExpenses;
};

/**
 * Calculate Owner's Equity
 * Equity = Capital + Net Profit - Drawings
 */
export const calculateTotalEquity = (accounts, transactions) => {
    // Capital accounts (credit-normal)
    const capitalAccounts = accounts.filter(a => a.type === 'Equity' && a.name !== 'Drawings');
    const totalCapital = capitalAccounts.reduce((sum, account) => {
        const { creditTotal, debitTotal } = calculateAccountBalance(account, transactions);
        return sum + (creditTotal - debitTotal);
    }, 0);

    // Drawings (debit-normal, contra-equity)
    const drawingsAccount = accounts.find(a => a.name === 'Drawings');
    const drawingsBalance = drawingsAccount 
        ? calculateAccountBalance(drawingsAccount, transactions).debitTotal - 
          calculateAccountBalance(drawingsAccount, transactions).creditTotal
        : 0;

    // Net Profit
    const netProfit = calculateNetProfit(accounts, transactions);

    // Total Equity = Capital + Net Profit - Drawings
    return totalCapital + netProfit - drawingsBalance;
};

/**
 * Get accounts with balances for Trial Balance
 * Trial Balance lists accounts with their DEBIT or CREDIT balances
 * Total Debits MUST equal Total Credits
 */
export const getAccountsWithBalances = (accounts, transactions) => {
    return accounts.map(account => {
        const balanceInfo = calculateAccountBalance(account, transactions);
        return {
            ...account,
            ...balanceInfo
        };
    }).filter(account => account.balanceAmount > 0); // Only show accounts with activity
};

/**
 * Get Trial Balance totals
 * Returns total debits and total credits - they should be equal
 */
export const getTrialBalanceTotals = (accounts, transactions) => {
    const accountsWithBalances = getAccountsWithBalances(accounts, transactions);
    
    const totalDebits = accountsWithBalances
        .filter(a => a.balanceType === 'Debit')
        .reduce((sum, a) => sum + a.balanceAmount, 0);
    
    const totalCredits = accountsWithBalances
        .filter(a => a.balanceType === 'Credit')
        .reduce((sum, a) => sum + a.balanceAmount, 0);
    
    return {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
    };
};

/**
 * Validate the Accounting Equation
 * Assets = Liabilities + Owner's Equity
 */
export const validateAccountingEquation = (accounts, transactions) => {
    const totalAssets = calculateGroupTotal(accounts, transactions, 'Asset');
    const totalLiabilities = calculateGroupTotal(accounts, transactions, 'Liability');
    const totalEquity = calculateTotalEquity(accounts, transactions);
    
    const leftSide = totalAssets; // Assets
    const rightSide = totalLiabilities + totalEquity; // Liabilities + Equity
    
    return {
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: Math.abs(leftSide - rightSide) < 0.01,
        difference: leftSide - rightSide
    };
};

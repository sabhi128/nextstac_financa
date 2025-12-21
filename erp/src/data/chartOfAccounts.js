// Chart of Accounts - Enhanced for ERP Business Logic
export const chartOfAccounts = [
    // --- ASSETS ---
    // Current Assets
    {
        id: 'cash',
        name: 'Cash on Hand',
        type: 'Asset',
        category: 'Current Asset',
        normalBalance: 'Debit',
        description: 'Physical cash held by the company'
    },
    {
        id: 'bank',
        name: 'Bank Account',
        type: 'Asset',
        category: 'Current Asset',
        normalBalance: 'Debit',
        description: 'Funds held in business bank accounts'
    },
    {
        id: 'accounts-receivable',
        name: 'Accounts Receivable',
        type: 'Asset',
        category: 'Current Asset',
        normalBalance: 'Debit',
        description: 'Money owed by customers'
    },
    {
        id: 'inventory',
        name: 'Inventory',
        type: 'Asset',
        category: 'Current Asset',
        normalBalance: 'Debit',
        description: 'Stock of goods available for sale'
    },

    // Fixed Assets
    {
        id: 'furniture',
        name: 'Furniture & Fixtures',
        type: 'Asset',
        category: 'Fixed Asset',
        normalBalance: 'Debit',
        description: 'Long-term furniture for business operations'
    },
    {
        id: 'office-equipment',
        name: 'Office Equipment',
        type: 'Asset',
        category: 'Fixed Asset',
        normalBalance: 'Debit',
        description: 'Laptops, computers, and office machines'
    },
    {
        id: 'vehicles',
        name: 'Vehicles',
        type: 'Asset',
        category: 'Fixed Asset',
        normalBalance: 'Debit',
        description: 'Company owned vehicles'
    },
    {
        id: 'building',
        name: 'Building & Land',
        type: 'Asset',
        category: 'Fixed Asset',
        normalBalance: 'Debit',
        description: 'Real estate owned by the company'
    },

    // --- LIABILITIES ---
    // Current Liabilities
    {
        id: 'accounts-payable',
        name: 'Accounts Payable',
        type: 'Liability',
        category: 'Current Liability',
        normalBalance: 'Credit',
        description: 'Money owed to vendors/suppliers'
    },
    {
        id: 'salaries-payable',
        name: 'Salaries Payable',
        type: 'Liability',
        category: 'Current Liability',
        normalBalance: 'Credit',
        description: 'Wages owed to employees'
    },
    {
        id: 'tax-payable',
        name: 'Tax Payable',
        type: 'Liability',
        category: 'Current Liability',
        normalBalance: 'Credit',
        description: 'Taxes owed to the government'
    },
    {
        id: 'utilities-payable',
        name: 'Utilities Payable',
        type: 'Liability',
        category: 'Current Liability',
        normalBalance: 'Credit',
        description: 'Unpaid utility bills'
    },

    // Non-Current Liabilities
    {
        id: 'bank-loan',
        name: 'Bank Loan (Long Term)',
        type: 'Liability',
        category: 'Non-Current Liability',
        normalBalance: 'Credit',
        description: 'Long term debt obligations'
    },

    // --- EQUITY ---
    {
        id: 'owners-capital',
        name: "Owner's Capital",
        type: 'Equity',
        category: 'Equity',
        normalBalance: 'Credit',
        description: 'Initial investment by the owner'
    },
    {
        id: 'drawings',
        name: 'Drawings',
        type: 'Equity',
        category: 'Equity',
        normalBalance: 'Debit', // Contra-Equity
        description: 'Withdrawals by the owner for personal use'
    },
    {
        id: 'retained-earnings',
        name: 'Retained Earnings',
        type: 'Equity',
        category: 'Equity',
        normalBalance: 'Credit',
        description: 'Profits reinvested in the business'
    },

    // --- REVENUE ---
    {
        id: 'sales-revenue',
        name: 'Sales Revenue',
        type: 'Revenue',
        category: 'Operating Revenue',
        normalBalance: 'Credit',
        description: 'Income from selling goods'
    },
    {
        id: 'service-revenue',
        name: 'Service Revenue',
        type: 'Revenue',
        category: 'Operating Revenue',
        normalBalance: 'Credit',
        description: 'Income from providing services'
    },
    {
        id: 'interest-income',
        name: 'Interest Income',
        type: 'Revenue',
        category: 'Non-Operating Revenue',
        normalBalance: 'Credit',
        description: 'Income from bank interest'
    },

    // --- EXPENSES ---
    {
        id: 'cost-of-goods-sold',
        name: 'Cost of Goods Sold',
        type: 'Expense',
        category: 'Direct Expense',
        normalBalance: 'Debit',
        description: 'Direct costs of producing goods sold'
    },
    {
        id: 'rent-expense',
        name: 'Rent Expense',
        type: 'Expense',
        category: 'Operating Expense',
        normalBalance: 'Debit'
    },
    {
        id: 'salary-expense',
        name: 'Salary Expense',
        type: 'Expense',
        category: 'Operating Expense',
        normalBalance: 'Debit'
    },
    {
        id: 'utilities-expense',
        name: 'Utilities Expense',
        type: 'Expense',
        category: 'Operating Expense',
        normalBalance: 'Debit'
    },
    {
        id: 'marketing-expense',
        name: 'Marketing Expense',
        type: 'Expense',
        category: 'Operating Expense',
        normalBalance: 'Debit'
    },
    {
        id: 'purchases',
        name: 'Purchases',
        type: 'Expense',
        category: 'Direct Expense',
        normalBalance: 'Debit',
        description: 'Purchase of goods for resale'
    },
    {
        id: 'office-supplies',
        name: 'Office Supplies',
        type: 'Expense',
        category: 'Operating Expense',
        normalBalance: 'Debit'
    }
];

// Helper function to get account by ID
export const getAccountById = (id) => {
    return chartOfAccounts.find(account => account.id === id);
};

// Helper function to get accounts by type
export const getAccountsByType = (type) => {
    return chartOfAccounts.filter(account => account.type === type);
};


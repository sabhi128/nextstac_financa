import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';
import { 
    calculateAccountBalance, 
    isDebitNormalBalance 
} from '../utils/accountingCalculations';

// Helper to format currency
const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(num);
};

// Helper to format currency for PDF (without $ symbol for tables)
const formatNumber = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to format date
const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Get date range based on period type
export const getDateRange = (periodType) => {
    const now = new Date();
    let startDate, endDate;

    switch (periodType) {
        case 'weekly':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay() - 7);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear() - 1, 11, 31);
            break;
        case 'current-week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            endDate = now;
            break;
        case 'current-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
            break;
        case 'current-year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = now;
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
    }

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: `${formatDate(startDate)} - ${formatDate(endDate)}`
    };
};

// Filter transactions by date range
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    return transactions.filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return tDate >= new Date(startDate) && tDate <= new Date(endDate);
    });
};

// Generate report data
export const generateReportData = (accounts, transactions, periodType) => {
    const dateRange = getDateRange(periodType);
    const filteredTransactions = filterTransactionsByDateRange(
        transactions,
        dateRange.startDate,
        dateRange.endDate
    );

    const safeAccounts = accounts || [];

    const getSignedBalance = (account, txns) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, txns);
        if (isDebitNormalBalance(account.type) || account.name === 'Drawings') {
            return debitTotal - creditTotal;
        }
        return creditTotal - debitTotal;
    };

    const accountBalances = safeAccounts.map(account => {
        const { debitTotal, creditTotal, balanceAmount, balanceType, normalBalance } = 
            calculateAccountBalance(account, filteredTransactions);
        const signedBalance = getSignedBalance(account, filteredTransactions);
        
        return {
            ...account,
            debitTotal,
            creditTotal,
            balance: balanceAmount,
            signedBalance,
            balanceType,
            normalBalance
        };
    }).filter(acc => acc.balance > 0);

    const assetAccounts = accountBalances.filter(a => a.type === 'Asset');
    const liabilityAccounts = accountBalances.filter(a => a.type === 'Liability');
    const equityAccounts = accountBalances.filter(a => a.type === 'Equity');
    const revenueAccounts = accountBalances.filter(a => a.type === 'Revenue');
    const expenseAccounts = accountBalances.filter(a => a.type === 'Expense');

    const totalAssets = safeAccounts
        .filter(a => a.type === 'Asset')
        .reduce((sum, account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
            return sum + (debitTotal - creditTotal);
        }, 0);

    const totalLiabilities = safeAccounts
        .filter(a => a.type === 'Liability')
        .reduce((sum, account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
            return sum + (creditTotal - debitTotal);
        }, 0);

    const totalRevenue = safeAccounts
        .filter(a => a.type === 'Revenue')
        .reduce((sum, account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
            return sum + (creditTotal - debitTotal);
        }, 0);

    const totalExpenses = safeAccounts
        .filter(a => a.type === 'Expense')
        .reduce((sum, account) => {
            const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
            return sum + (debitTotal - creditTotal);
        }, 0);

    const netProfit = totalRevenue - totalExpenses;

    const capitalAccounts = safeAccounts.filter(a => a.type === 'Equity' && a.name !== 'Drawings');
    const totalCapital = capitalAccounts.reduce((sum, account) => {
        const { debitTotal, creditTotal } = calculateAccountBalance(account, filteredTransactions);
        return sum + (creditTotal - debitTotal);
    }, 0);

    const drawingsAccount = safeAccounts.find(a => a.name === 'Drawings');
    const drawingsBalance = drawingsAccount 
        ? calculateAccountBalance(drawingsAccount, filteredTransactions).debitTotal - 
          calculateAccountBalance(drawingsAccount, filteredTransactions).creditTotal
        : 0;

    const totalEquity = totalCapital + netProfit - drawingsBalance;

    const totalDebits = accountBalances
        .filter(a => a.balanceType === 'Debit')
        .reduce((sum, a) => sum + a.balance, 0);
    const totalCredits = accountBalances
        .filter(a => a.balanceType === 'Credit')
        .reduce((sum, a) => sum + a.balance, 0);

    return {
        periodType,
        dateRange,
        transactionCount: filteredTransactions.length,
        transactions: filteredTransactions,
        accountBalances,
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        revenueAccounts,
        expenseAccounts,
        summary: {
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalCapital,
            drawingsBalance,
            totalRevenue,
            totalExpenses,
            netProfit,
            totalDebits,
            totalCredits,
            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
            accountingEquationBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        }
    };
};

// Generate PDF Report
export const generatePDF = (reportData) => {
    const doc = new jsPDF();
    
    const dateRange = reportData.dateRange || { label: 'N/A', startDate: '', endDate: '' };
    const summary = reportData.summary || {};
    const accountBalances = reportData.accountBalances || [];
    const transactions = reportData.transactions || [];
    const revenueAccounts = reportData.revenueAccounts || [];
    const expenseAccounts = reportData.expenseAccounts || [];
    const assetAccounts = reportData.assetAccounts || [];
    const liabilityAccounts = reportData.liabilityAccounts || [];
    const equityAccounts = reportData.equityAccounts || [];
    
    let periodLabel = 'Financial Report';
    if (reportData.periodType) {
        if (reportData.periodType === 'custom') {
            periodLabel = 'Custom Period Report';
        } else {
            periodLabel = reportData.periodType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Report';
        }
    }

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 220, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Office Ledger Pro', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(periodLabel, 14, 28);

    // Date info
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Period: ${dateRange.label}`, 14, 45);
    doc.text(`Generated: ${formatDate(new Date())}`, 14, 51);

    let yPos = 62;

    // Executive Summary
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPos);
    yPos += 6;

    const summaryData = [
        ['Total Revenue', formatCurrency(summary.totalRevenue || 0)],
        ['Total Expenses', formatCurrency(summary.totalExpenses || 0)],
        ['Net Profit/Loss', formatCurrency(summary.netProfit || 0)],
        ['Total Assets', formatCurrency(summary.totalAssets || 0)],
        ['Total Liabilities', formatCurrency(summary.totalLiabilities || 0)],
        ['Total Equity', formatCurrency(summary.totalEquity || 0)],
        ['Transactions', String(reportData.transactionCount || 0)]
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Amount']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        tableWidth: 90
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // Trial Balance
    if (accountBalances.length > 0) {
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Trial Balance', 14, yPos);
        yPos += 6;

        const trialData = accountBalances.map(acc => [
            acc.name || 'Unknown',
            acc.type || 'N/A',
            acc.balanceType === 'Debit' ? formatNumber(acc.balance) : '',
            acc.balanceType === 'Credit' ? formatNumber(acc.balance) : ''
        ]);
        
        trialData.push(['TOTAL', '', formatNumber(summary.totalDebits || 0), formatNumber(summary.totalCredits || 0)]);

        autoTable(doc, {
            startY: yPos,
            head: [['Account', 'Type', 'Debit ($)', 'Credit ($)']],
            body: trialData,
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 138], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            margin: { left: 14, right: 14 }
        });
    }

    // New page for Income Statement
    doc.addPage();
    yPos = 20;

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Income Statement', 14, yPos);
    yPos += 6;

    const incomeData = [];
    if (revenueAccounts.length > 0) {
        incomeData.push(['REVENUE', '', '']);
        revenueAccounts.forEach(acc => {
            incomeData.push(['  ' + (acc.name || 'Unknown'), formatNumber(acc.balance || 0), '']);
        });
    }
    incomeData.push(['Total Revenue', '', formatNumber(summary.totalRevenue || 0)]);
    incomeData.push(['', '', '']);
    
    if (expenseAccounts.length > 0) {
        incomeData.push(['EXPENSES', '', '']);
        expenseAccounts.forEach(acc => {
            incomeData.push(['  ' + (acc.name || 'Unknown'), formatNumber(acc.balance || 0), '']);
        });
    }
    incomeData.push(['Total Expenses', '', formatNumber(summary.totalExpenses || 0)]);
    incomeData.push(['', '', '']);
    incomeData.push(['NET PROFIT/LOSS', '', formatNumber(summary.netProfit || 0)]);

    autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Amount ($)', 'Total ($)']],
        body: incomeData,
        theme: 'plain',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Balance Sheet
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Sheet', 14, yPos);
    yPos += 6;

    const balanceData = [];
    balanceData.push(['ASSETS', '', '']);
    assetAccounts.forEach(acc => {
        balanceData.push(['  ' + (acc.name || 'Unknown'), formatNumber(acc.balance || 0), '']);
    });
    balanceData.push(['Total Assets', '', formatNumber(summary.totalAssets || 0)]);
    balanceData.push(['', '', '']);
    
    balanceData.push(['LIABILITIES', '', '']);
    liabilityAccounts.forEach(acc => {
        balanceData.push(['  ' + (acc.name || 'Unknown'), formatNumber(acc.balance || 0), '']);
    });
    balanceData.push(['Total Liabilities', '', formatNumber(summary.totalLiabilities || 0)]);
    balanceData.push(['', '', '']);
    
    balanceData.push(['EQUITY', '', '']);
    equityAccounts.forEach(acc => {
        balanceData.push(['  ' + (acc.name || 'Unknown'), formatNumber(acc.balance || 0), '']);
    });
    balanceData.push(['  Retained Earnings', formatNumber(summary.netProfit || 0), '']);
    balanceData.push(['Total Equity', '', formatNumber((summary.totalEquity || 0) + (summary.netProfit || 0))]);
    balanceData.push(['', '', '']);
    balanceData.push(['TOTAL LIAB. + EQUITY', '', formatNumber((summary.totalLiabilities || 0) + (summary.totalEquity || 0) + (summary.netProfit || 0))]);

    autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Amount ($)', 'Total ($)']],
        body: balanceData,
        theme: 'plain',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });

    // Transactions page
    if (transactions.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setTextColor(30, 58, 138);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Transaction Details', 14, yPos);
        yPos += 6;

        const txData = transactions.map(t => [
            t.date || 'N/A',
            (t.description || 'N/A').substring(0, 30),
            t.debit_account?.name || t.debitAccount?.name || 'N/A',
            t.credit_account?.name || t.creditAccount?.name || 'N/A',
            formatNumber(parseFloat(t.amount) || 0)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Description', 'Debit Acc', 'Credit Acc', 'Amount ($)']],
            body: txData,
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            margin: { left: 14, right: 14 },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 45 },
                4: { halign: 'right' }
            }
        });
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(
            `Office Ledger Pro | Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    return doc;
};

// Download PDF
export const downloadPDF = (reportData) => {
    try {
        console.log('Starting PDF generation...', reportData);
        const doc = generatePDF(reportData);
        
        let periodLabel = 'Report';
        if (reportData.periodType) {
            if (reportData.periodType === 'custom') {
                periodLabel = 'Custom';
            } else {
                periodLabel = reportData.periodType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
            }
        }
        
        const startDate = reportData.dateRange?.startDate || new Date().toISOString().split('T')[0];
        const endDate = reportData.dateRange?.endDate || new Date().toISOString().split('T')[0];
        const fileName = `Financial_Report_${periodLabel}_${startDate}_to_${endDate}.pdf`;
        
        console.log('Saving PDF as:', fileName);
        doc.save(fileName);
        console.log('PDF saved successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF: ' + error.message);
    }
};

// Generate Excel Report
export const generateExcel = (reportData) => {
    const dateRange = reportData.dateRange || { label: 'N/A', startDate: '', endDate: '' };
    const summary = reportData.summary || {};
    const accountBalances = reportData.accountBalances || [];
    const transactions = reportData.transactions || [];
    const revenueAccounts = reportData.revenueAccounts || [];
    const expenseAccounts = reportData.expenseAccounts || [];
    const assetAccounts = reportData.assetAccounts || [];
    const liabilityAccounts = reportData.liabilityAccounts || [];
    const equityAccounts = reportData.equityAccounts || [];
    
    let periodLabel = 'Financial Report';
    if (reportData.periodType) {
        if (reportData.periodType === 'custom') {
            periodLabel = 'Custom Period';
        } else {
            periodLabel = reportData.periodType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    const wb = XLSX.utils.book_new();

    // Summary Sheet (includes Trial Balance table)
    const summarySheet = [
        ['OFFICE LEDGER PRO - FINANCIAL REPORT'],
        [`Period: ${periodLabel}`],
        [`Date Range: ${dateRange.label}`],
        [`Generated: ${formatDate(new Date())}`],
        [],
        ['EXECUTIVE SUMMARY'],
        ['Metric', 'Amount'],
        ['Total Revenue', summary.totalRevenue || 0],
        ['Total Expenses', summary.totalExpenses || 0],
        ['Net Profit/Loss', summary.netProfit || 0],
        ['Total Assets', summary.totalAssets || 0],
        ['Total Liabilities', summary.totalLiabilities || 0],
        ['Total Equity', summary.totalEquity || 0],
        ['Transaction Count', reportData.transactionCount || 0],
        [],
        ['Balance Status', summary.isBalanced ? 'BALANCED' : 'UNBALANCED'],
        [],
        [],
        ['TRIAL BALANCE SUMMARY'],
        ['Account', 'Type', 'Debit', 'Credit'],
        ...accountBalances.map(acc => [
            acc.name || 'Unknown',
            acc.type || 'N/A',
            acc.balanceType === 'Debit' ? acc.balance : '',
            acc.balanceType === 'Credit' ? acc.balance : ''
        ]),
        [],
        ['TOTAL', '', summary.totalDebits || 0, summary.totalCredits || 0]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Trial Balance Sheet
    const trialBalanceSheet = [
        ['TRIAL BALANCE'],
        [`Period: ${dateRange.label}`],
        [],
        ['Account', 'Type', 'Debit', 'Credit'],
        ...accountBalances.map(acc => [
            acc.name || 'Unknown',
            acc.type || 'N/A',
            acc.balanceType === 'Debit' ? acc.balance : '',
            acc.balanceType === 'Credit' ? acc.balance : ''
        ]),
        [],
        ['TOTAL', '', summary.totalDebits || 0, summary.totalCredits || 0],
        [],
        ['Balance Status', summary.isBalanced ? 'BALANCED' : 'UNBALANCED', '', '']
    ];
    const wsTrial = XLSX.utils.aoa_to_sheet(trialBalanceSheet);
    XLSX.utils.book_append_sheet(wb, wsTrial, 'Trial Balance');

    // Income Statement Sheet
    const incomeSheet = [
        ['INCOME STATEMENT'],
        [`Period: ${dateRange.label}`],
        [],
        ['REVENUE'],
        ['Account', 'Amount'],
        ...revenueAccounts.map(acc => [acc.name || 'Unknown', acc.balance || 0]),
        ['Total Revenue', summary.totalRevenue || 0],
        [],
        ['EXPENSES'],
        ['Account', 'Amount'],
        ...expenseAccounts.map(acc => [acc.name || 'Unknown', acc.balance || 0]),
        ['Total Expenses', summary.totalExpenses || 0],
        [],
        ['NET PROFIT/LOSS', summary.netProfit || 0]
    ];
    const wsIncome = XLSX.utils.aoa_to_sheet(incomeSheet);
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income Statement');

    // Balance Sheet
    const balanceSheetData = [
        ['BALANCE SHEET'],
        [`As of: ${dateRange.endDate}`],
        [],
        ['ASSETS'],
        ['Account', 'Amount'],
        ...assetAccounts.map(acc => [acc.name || 'Unknown', acc.balance || 0]),
        ['Total Assets', summary.totalAssets || 0],
        [],
        ['LIABILITIES'],
        ['Account', 'Amount'],
        ...liabilityAccounts.map(acc => [acc.name || 'Unknown', acc.balance || 0]),
        ['Total Liabilities', summary.totalLiabilities || 0],
        [],
        ['EQUITY'],
        ['Account', 'Amount'],
        ...equityAccounts.map(acc => [acc.name || 'Unknown', acc.balance || 0]),
        ['Retained Earnings', summary.netProfit || 0],
        ['Total Equity', (summary.totalEquity || 0) + (summary.netProfit || 0)],
        [],
        ['Total Liabilities + Equity', (summary.totalLiabilities || 0) + (summary.totalEquity || 0) + (summary.netProfit || 0)]
    ];
    const wsBalance = XLSX.utils.aoa_to_sheet(balanceSheetData);
    XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance Sheet');

    // Transactions Sheet
    if (transactions.length > 0) {
        const transactionsSheet = [
            ['TRANSACTION DETAILS'],
            [`Period: ${dateRange.label}`],
            [],
            ['Date', 'Description', 'Debit Account', 'Credit Account', 'Amount'],
            ...transactions.map(t => [
                t.date || 'N/A',
                t.description || 'N/A',
                t.debit_account?.name || t.debitAccount?.name || 'N/A',
                t.credit_account?.name || t.creditAccount?.name || 'N/A',
                parseFloat(t.amount) || 0
            ])
        ];
        const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsSheet);
        XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
    }

    return wb;
};

// Download Excel
export const downloadExcel = (reportData) => {
    try {
        console.log('Starting Excel generation...', reportData);
        const wb = generateExcel(reportData);
        
        let periodLabel = 'Report';
        if (reportData.periodType) {
            if (reportData.periodType === 'custom') {
                periodLabel = 'Custom';
            } else {
                periodLabel = reportData.periodType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
            }
        }
        
        const startDate = reportData.dateRange?.startDate || new Date().toISOString().split('T')[0];
        const endDate = reportData.dateRange?.endDate || new Date().toISOString().split('T')[0];
        const fileName = `Financial_Report_${periodLabel}_${startDate}_to_${endDate}.xlsx`;

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, fileName);
        console.log('Excel saved successfully');
    } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Failed to generate Excel: ' + error.message);
    }
};

// Save report to database
export const saveReportToDatabase = async (reportData) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .insert([{
                period_type: reportData.periodType,
                start_date: reportData.dateRange.startDate,
                end_date: reportData.dateRange.endDate,
                total_assets: reportData.summary.totalAssets,
                total_liabilities: reportData.summary.totalLiabilities,
                total_equity: reportData.summary.totalEquity,
                total_revenue: reportData.summary.totalRevenue,
                total_expenses: reportData.summary.totalExpenses,
                net_profit: reportData.summary.netProfit,
                transaction_count: reportData.transactionCount,
                report_data: JSON.stringify(reportData)
            }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error saving report:', error);
        throw error;
    }
};

// Fetch saved reports from database
export const fetchSavedReports = async () => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
};

// Check if report should be shown
export const shouldShowReport = (periodType, lastShownDate) => {
    if (!lastShownDate) return true;

    const now = new Date();
    const lastShown = new Date(lastShownDate);

    switch (periodType) {
        case 'weekly':
            const weekDiff = (now - lastShown) / (1000 * 60 * 60 * 24);
            return weekDiff >= 7;
        case 'monthly':
            return now.getMonth() !== lastShown.getMonth() || now.getFullYear() !== lastShown.getFullYear();
        case 'yearly':
            return now.getFullYear() !== lastShown.getFullYear();
        default:
            return false;
    }
};

// Get the next report due info
export const getNextReportDue = () => {
    const now = new Date();

    const nextWeekly = new Date(now);
    nextWeekly.setDate(now.getDate() + (7 - now.getDay()));
    nextWeekly.setHours(0, 0, 0, 0);

    const nextMonthly = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextYearly = new Date(now.getFullYear() + 1, 0, 1);

    return {
        weekly: nextWeekly,
        monthly: nextMonthly,
        yearly: nextYearly
    };
};

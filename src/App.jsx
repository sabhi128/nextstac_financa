import { useState, useEffect, useCallback } from 'react'
import { financeService } from './services/financeService'
import {
  generateReportData,
  shouldShowReport
} from './services/reportService'
import JournalEntryForm from './components/JournalEntryForm'
import GeneralJournal from './components/GeneralJournal'
import LedgerDashboard from './components/LedgerDashboard'
import TAccountView from './components/TAccountView'
import TrialBalance from './components/TrialBalance'
import IncomeStatement from './components/IncomeStatement'
import BalanceSheet from './components/BalanceSheet'
import HomeDashboard from './components/HomeDashboard'
import GenerateReports from './components/GenerateReports'
import ReportModal from './components/ReportModal'

// Local storage keys for tracking report popup timing
const STORAGE_KEYS = {
  WEEKLY_SHOWN: 'office_ledger_weekly_report_shown',
  MONTHLY_SHOWN: 'office_ledger_monthly_report_shown',
  YEARLY_SHOWN: 'office_ledger_yearly_report_shown'
}

// Navigation items configuration
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'journal', label: 'Journal' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'reports', label: 'Reports' },
  { id: 'generate-reports', label: 'Generate Reports' },
]

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [activeReport, setActiveReport] = useState('trial-balance')
  const [selectedAccount, setSelectedAccount] = useState(null)

  // Data State
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Report State
  const [showReportModal, setShowReportModal] = useState(false)
  const [currentReportData, setCurrentReportData] = useState(null)
  const [pendingReportType, setPendingReportType] = useState(null)

  // Check and show automatic reports
  const checkAndShowReports = useCallback((accountsData, transactionsData) => {
    if (!accountsData.length || !transactionsData.length) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const month = now.getMonth();

    const lastWeeklyShown = localStorage.getItem(STORAGE_KEYS.WEEKLY_SHOWN);
    if (dayOfWeek === 0 && shouldShowReport('weekly', lastWeeklyShown)) {
      const reportData = generateReportData(accountsData, transactionsData, 'weekly');
      if (reportData.transactionCount > 0) {
        setCurrentReportData(reportData);
        setPendingReportType('weekly');
        setShowReportModal(true);
        return;
      }
    }

    const lastMonthlyShown = localStorage.getItem(STORAGE_KEYS.MONTHLY_SHOWN);
    if (dayOfMonth === 1 && shouldShowReport('monthly', lastMonthlyShown)) {
      const reportData = generateReportData(accountsData, transactionsData, 'monthly');
      if (reportData.transactionCount > 0) {
        setCurrentReportData(reportData);
        setPendingReportType('monthly');
        setShowReportModal(true);
        return;
      }
    }

    const lastYearlyShown = localStorage.getItem(STORAGE_KEYS.YEARLY_SHOWN);
    if (month === 0 && dayOfMonth === 1 && shouldShowReport('yearly', lastYearlyShown)) {
      const reportData = generateReportData(accountsData, transactionsData, 'yearly');
      if (reportData.transactionCount > 0) {
        setCurrentReportData(reportData);
        setPendingReportType('yearly');
        setShowReportModal(true);
        return;
      }
    }
  }, []);

  // Initial Data Fetching
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        await financeService.seedAccounts()

        const [fetchedAccounts, fetchedTransactions] = await Promise.all([
          financeService.fetchAccounts(),
          financeService.fetchTransactions()
        ])

        setAccounts(fetchedAccounts)
        setTransactions(fetchedTransactions)

        setTimeout(() => {
          checkAndShowReports(fetchedAccounts, fetchedTransactions)
        }, 1000)

      } catch (err) {
        console.error('Failed to initialize data:', err)
        setError('Failed to load financial data. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [checkAndShowReports])

  const handlePostEntry = async (entry) => {
    try {
      await financeService.addTransaction(entry)
      const updatedTransactions = await financeService.fetchTransactions()
      setTransactions(updatedTransactions)
      return true
    } catch (err) {
      console.error('Failed to post entry:', err)
      alert(err.message)
      return false
    }
  }

  const handleAccountClick = (account) => {
    setSelectedAccount(account)
  }

  const handleCloseTAccount = () => {
    setSelectedAccount(null)
  }

  const handleCloseReportModal = () => {
    if (pendingReportType) {
      const storageKey = {
        weekly: STORAGE_KEYS.WEEKLY_SHOWN,
        monthly: STORAGE_KEYS.MONTHLY_SHOWN,
        yearly: STORAGE_KEYS.YEARLY_SHOWN
      }[pendingReportType];

      if (storageKey) {
        localStorage.setItem(storageKey, new Date().toISOString());
      }
    }
    setShowReportModal(false);
    setCurrentReportData(null);
    setPendingReportType(null);
  }

  // Manual report generation trigger (for Quick Report dropdown)
  const triggerManualReport = (periodType) => {
    if (!accounts.length || !transactions.length) return;
    const reportData = generateReportData(accounts, transactions, periodType);
    setCurrentReportData(reportData);
    setPendingReportType(periodType);
    setShowReportModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Financial Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-200">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        reportData={currentReportData}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveView('dashboard')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 text-lg leading-tight">Office Ledger</h1>
                <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Pro Finance</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeView === item.id
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Report Dropdown */}
              <div className="relative group">
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Quick Report
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">Current Period</p>
                  <button
                    onClick={() => triggerManualReport('current-week')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => triggerManualReport('current-month')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => triggerManualReport('current-year')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    This Year
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">Previous Period</p>
                  <button
                    onClick={() => triggerManualReport('weekly')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => triggerManualReport('monthly')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => triggerManualReport('yearly')}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    Last Year
                  </button>
                </div>
              </div>

              {/* Double Entry Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Double Entry Active
              </div>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-transform">
                U
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-100 px-2 py-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeView === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <HomeDashboard
            accounts={accounts}
            transactions={transactions}
            loading={loading}
          />
        )}

        {activeView === 'journal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Journal Entries</h2>
                <p className="text-slate-500 text-sm mt-1">Record and view all financial transactions</p>
              </div>
            </div>
            
            <JournalEntryForm onPostEntry={handlePostEntry} accounts={accounts} />
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Entries</h3>
              <GeneralJournal transactions={transactions} />
            </div>
          </div>
        )}

        {activeView === 'ledger' && (
          <div className="animate-in fade-in duration-300">
            {selectedAccount ? (
              <TAccountView
                account={selectedAccount}
                transactions={transactions}
                onClose={handleCloseTAccount}
              />
            ) : (
              <LedgerDashboard
                onAccountClick={handleAccountClick}
                transactions={transactions}
                accounts={accounts}
              />
            )}
          </div>
        )}

        {activeView === 'reports' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>
              <p className="text-slate-500 text-sm mt-1">View your accounting statements</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex gap-1">
                {[
                  { id: 'trial-balance', label: 'Trial Balance' },
                  { id: 'income-statement', label: 'Income Statement' },
                  { id: 'balance-sheet', label: 'Balance Sheet' },
                ].map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeReport === report.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {report.label}
                  </button>
                ))}
              </div>
            </div>

            {activeReport === 'trial-balance' && <TrialBalance transactions={transactions} accounts={accounts} />}
            {activeReport === 'income-statement' && <IncomeStatement transactions={transactions} accounts={accounts} />}
            {activeReport === 'balance-sheet' && <BalanceSheet transactions={transactions} accounts={accounts} />}
          </div>
        )}

        {activeView === 'generate-reports' && (
          <GenerateReports
            accounts={accounts}
            transactions={transactions}
          />
        )}
      </main>
    </div>
  )
}

export default App

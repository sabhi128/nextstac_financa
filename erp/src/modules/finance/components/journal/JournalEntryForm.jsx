import { useState } from 'react';
import { Check, X, Calendar, DollarSign, AlignLeft, ChevronDown } from 'lucide-react';

const JournalEntryForm = ({ onPostEntry, accounts }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [debitAccountId, setDebitAccountId] = useState('');
    const [creditAccountId, setCreditAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Filter accounts
    const filterAccounts = (type) => accounts.filter(a => a.type === type);
    const assetAccounts = filterAccounts('Asset');
    const liabilityAccounts = filterAccounts('Liability');
    const equityAccounts = filterAccounts('Equity');
    const revenueAccounts = filterAccounts('Revenue');
    const expenseAccounts = filterAccounts('Expense');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const debitAccount = accounts.find(a => a.id === debitAccountId);
        const creditAccount = accounts.find(a => a.id === creditAccountId);

        const entry = {
            date,
            description,
            debit_account_id: debitAccountId,
            credit_account_id: creditAccountId,
            debitAccount,
            creditAccount,
            amount: parseFloat(amount)
        };

        const success = await onPostEntry(entry);

        setIsSubmitting(false);

        if (success) {
            setShowSuccess(true);
            setDescription('');
            setDebitAccountId('');
            setCreditAccountId('');
            setAmount('');
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const isFormValid =
        description &&
        debitAccountId &&
        creditAccountId &&
        amount > 0 &&
        debitAccountId !== creditAccountId;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative">
            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300 z-10">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Entry Recorded</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Top Row: Date & Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-3 pr-10 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-slate-700 font-medium"
                                required
                            />
                            <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3 font-bold text-slate-400 group-focus-within:text-indigo-500 transition-colors">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none font-bold text-slate-700 text-lg placeholder:font-normal"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none text-slate-700 placeholder:text-slate-400"
                        placeholder="Enter transaction details..."
                        required
                    />
                </div>

                {/* Accounts Selection Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Debit */}
                    <div className="p-4 border-2 border-slate-100 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/30">
                        <label className="block text-sm font-bold text-slate-900 mb-3">Debit Account</label>
                        <div className="relative">
                            <select
                                value={debitAccountId}
                                onChange={(e) => setDebitAccountId(e.target.value)}
                                className="w-full p-3 pr-10 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700 shadow-sm cursor-pointer"
                                required
                            >
                                <option value="">Select Account...</option>
                                <optgroup label="Assets">
                                    {assetAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                                <optgroup label="Expenses">
                                    {expenseAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                                <optgroup label="Liabilities">
                                    {liabilityAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Credit */}
                    <div className="p-4 border-2 border-slate-100 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/30">
                        <label className="block text-sm font-bold text-slate-900 mb-3">Credit Account</label>
                        <div className="relative">
                            <select
                                value={creditAccountId}
                                onChange={(e) => setCreditAccountId(e.target.value)}
                                className="w-full p-3 pr-10 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none appearance-none font-medium text-slate-700 shadow-sm cursor-pointer"
                                required
                            >
                                <option value="">Select Account...</option>
                                <optgroup label="Assets">
                                    {assetAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                                <optgroup label="Revenue">
                                    {revenueAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                                <optgroup label="Liabilities">
                                    {liabilityAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                                <optgroup label="Equity">
                                    {equityAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Validation Warning */}
                {debitAccountId && creditAccountId && debitAccountId === creditAccountId && (
                    <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium bg-red-50 py-2 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Debit and Credit accounts cannot be the same
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className={`
                            w-full py-3.5 rounded-xl font-bold text-white shadow-sm transition-all text-sm uppercase tracking-wide
                            ${!isFormValid || isSubmitting
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg transform active:scale-[0.99]'
                            }
                        `}
                    >
                        {isSubmitting ? 'Recording Entry...' : 'Post Journal Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JournalEntryForm;

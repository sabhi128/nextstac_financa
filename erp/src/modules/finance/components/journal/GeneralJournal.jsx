import React from 'react';

const GeneralJournal = ({ transactions }) => {
    // Sort transactions by date descending
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-900 overflow-hidden">
            <div className="p-6 border-b-2 border-slate-900">
                <h3 className="text-lg font-bold text-slate-900">General Journal</h3>
                <p className="text-slate-500 text-xs mt-1">Double-entry bookkeeping records</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b-2 border-slate-900">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs text-slate-900 uppercase tracking-wider w-32">Date</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-900 uppercase tracking-wider w-1/3">Description</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-900 uppercase tracking-wider">Account</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-900 uppercase tracking-wider text-right w-32">Debit</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-900 uppercase tracking-wider text-right w-32">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-medium">
                                    No entries found.
                                </td>
                            </tr>
                        ) : (
                            sortedTransactions.map((transaction, index) => (
                                <React.Fragment key={transaction.id}>
                                    {/* Debit Row */}
                                    <tr className="bg-white group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 text-slate-700 font-medium font-mono text-xs pt-5">
                                            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 font-medium pt-5">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-3 text-slate-800 font-bold pt-5">
                                            {transaction.debit_account?.name || transaction.debitAccount?.name}
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono pt-5">
                                            {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-300 pt-5">
                                            -
                                        </td>
                                    </tr>
                                    {/* Credit Row */}
                                    <tr className="bg-white group hover:bg-slate-50/50 transition-colors border-b-2 border-slate-900 last:border-0">
                                        <td className="px-6 py-2"></td>
                                        <td className="px-6 py-2"></td>
                                        <td className="px-6 py-2 pb-5 text-slate-500 pl-16">
                                            {transaction.credit_account?.name || transaction.creditAccount?.name}
                                        </td>
                                        <td className="px-6 py-2 pb-5 text-right text-slate-300">
                                            -
                                        </td>
                                        <td className="px-6 py-2 pb-5 text-right font-bold text-slate-900 font-mono">
                                            {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GeneralJournal;

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import JournalEntryForm from '../components/journal/JournalEntryForm';
import GeneralJournal from '../components/journal/GeneralJournal';
import { FileText, DollarSign, Calendar } from 'lucide-react';

export default function Journal() {
    const queryClient = useQueryClient();

    const { data: accounts, isLoading: accountsLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: mockDataService.getAccounts,
    });

    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: mockDataService.getTransactions,
    });

    const addTransactionMutation = useMutation({
        mutationFn: mockDataService.addTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions']);
        },
    });

    const handlePostEntry = async (entry) => {
        try {
            await addTransactionMutation.mutateAsync(entry);
            return true;
        } catch (error) {
            console.error('Failed to post entry', error);
            return false;
        }
    };

    if (accountsLoading || transactionsLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

    // Stats Calculation
    const sortedTransactions = [...(transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalEntries = sortedTransactions.length;
    const totalValue = sortedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const latestEntryDate = sortedTransactions.length > 0
        ? new Date(sortedTransactions[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '-';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Journal Entries</h2>
                    <p className="text-slate-500 text-sm mt-1">Record and view all financial transactions</p>
                </div>

                {/* Entry Form */}
                <JournalEntryForm
                    accounts={accounts || []}
                    onPostEntry={handlePostEntry}
                />

                {/* Stats Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Entries</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Entries */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Entries</p>
                                <p className="text-3xl font-black text-slate-900">{totalEntries}</p>
                            </div>
                            <div className="p-3 bg-slate-200 rounded-xl text-slate-700">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Total Value */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Value</p>
                                <p className="text-3xl font-black text-slate-900">
                                    ${(totalValue / 1000).toFixed(1)}k
                                </p>
                            </div>
                            <div className="p-3 bg-slate-200 rounded-xl text-slate-700">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Latest Entry */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Latest Entry</p>
                                <p className="text-3xl font-black text-slate-900">{latestEntryDate}</p>
                            </div>
                            <div className="p-3 bg-slate-200 rounded-xl text-slate-700">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Journal Table */}
                <GeneralJournal transactions={transactions || []} />
            </div>
        </div>
    );
}

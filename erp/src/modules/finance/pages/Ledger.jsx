import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import LedgerDashboard from '../components/ledger/LedgerDashboard';
import TAccountView from '../components/ledger/TAccountView';
import { X } from 'lucide-react';


export default function Ledger() {
    const [selectedAccount, setSelectedAccount] = useState(null);

    const { data: accounts, isLoading: accountsLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: mockDataService.getAccounts,
    });

    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: mockDataService.getTransactions,
    });

    if (accountsLoading || transactionsLoading) return <div className="p-8 text-center text-slate-500">Loading Ledger...</div>;

    return (
        <div className="min-h-screen bg-slate-50">


            <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
                <LedgerDashboard
                    accounts={accounts || []}
                    transactions={transactions || []}
                    onAccountClick={setSelectedAccount}
                />
            </div>

            {/* T-Account Overlay/Modal */}
            {selectedAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative">
                        <TAccountView
                            account={selectedAccount}
                            transactions={transactions || []}
                            onClose={() => setSelectedAccount(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

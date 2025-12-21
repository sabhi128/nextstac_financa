import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    History,
    Plus,
    Trash2
} from 'lucide-react';


import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function StockMovements() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: movements, isLoading } = useQuery({
        queryKey: ['stock_movements'],
        queryFn: mockDataService.getStockMovements,
    });

    const deleteMovementMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteStockMovement(id)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['stock_movements'])
    });

    const addMovementMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addStockMovement(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['stock_movements']);
            setIsModalOpen(false);
        }
    });

    const [searchTerm, setSearchTerm] = useState('');

    const filteredMovements = movements?.filter(m =>
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading stock history...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <StockAdjustmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => addMovementMutation.mutate(data)}
            />

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Stock Movements</h2>
                        <p className="text-slate-500 text-sm">Track inventory logs and transfers</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Adjustment
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by product or reference..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Reference</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Quantity</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Warehouse</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements?.map((move) => (
                                    <tr key={move.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(move.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {move.reference}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {move.productName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {move.type === 'In' ? (
                                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                                    <ArrowDownLeft className="w-4 h-4" /> In
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                                    <ArrowUpRight className="w-4 h-4" /> Out
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {move.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {move.warehouse}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this stock log?')) {
                                                        deleteMovementMutation.mutate(move.id);
                                                    }
                                                }}
                                                className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Log"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

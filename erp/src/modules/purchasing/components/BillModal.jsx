import React, { useState, useEffect } from 'react';
import { X, Receipt, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import { mockDataService } from '../../../services/mockDataService';
import { useQuery } from '@tanstack/react-query';

export default function BillModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        vendor: '',
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: '',
        status: 'Pending'
    });

    const { data: vendors } = useQuery({
        queryKey: ['vendors'],
        queryFn: mockDataService.getVendors,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                vendor: '',
                billNumber: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                amount: '',
                status: 'Pending'
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Record New Bill</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit({
                        ...formData,
                        amount: parseFloat(formData.amount)
                    });
                }} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <select
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
                                value={formData.vendor}
                                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                            >
                                <option value="">Select Vendor</option>
                                {vendors?.map(v => (
                                    <option key={v.id} value={v.companyName}>{v.companyName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bill Number</label>
                        <div className="relative">
                            <Receipt className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="BILL-00000"
                                value={formData.billNumber}
                                onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bill Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <div className="relative">
                                <AlertCircle className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                        >
                            Record Bill
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

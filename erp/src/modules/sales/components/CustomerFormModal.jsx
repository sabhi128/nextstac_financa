import React, { useState, useEffect } from 'react';
import { X, Save, Building, User, Mail, Phone, MapPin } from 'lucide-react';

export default function CustomerFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'Active',
                    notes: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        // Do not reset here, wait for modal close or success from parent
    };

    const isEditing = !!initialData;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                    <h3 className="font-bold text-slate-800">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5" /> Company
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Acme Inc"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Phone
                                </label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Address
                            </label>
                            <input
                                type="text"
                                placeholder="Street Address, City, Zip"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Status</label>
                            <select
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notes</label>
                            <textarea
                                rows="3"
                                placeholder="Additional customer notes..."
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                                value={formData.notes || ''}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Save Changes' : 'Add Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

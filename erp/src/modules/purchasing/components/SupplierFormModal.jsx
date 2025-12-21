import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, Star } from 'lucide-react';

export default function SupplierFormModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        rating: 5,
        status: 'Active'
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    companyName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
                    rating: 5,
                    status: 'Active'
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {initialData ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(formData);
                }} className="p-6 space-y-4">

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Acme Corp"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.contactPerson}
                                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="tel"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="123 Business St, City"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                                <div className="relative">
                                    <Star className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.rating}
                                        onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
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
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
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
                            {initialData ? 'Save Changes' : 'Add Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

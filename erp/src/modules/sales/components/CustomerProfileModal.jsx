import React from 'react';
import { X, Building, Mail, Phone, MapPin, Calendar, ShoppingBag, FileText, CheckCircle, XCircle, User } from 'lucide-react';

export default function CustomerProfileModal({ isOpen, onClose, customer, onEdit }) {
    if (!isOpen || !customer) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>;
            case 'Inactive': return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>;
            case 'Lead': return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase flex items-center gap-1"><User className="w-3 h-3" /> Lead</span>;
            default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase">{status}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-4 md:px-6 py-4 md:py-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{customer.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Building className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                                <span className="text-sm md:text-base text-slate-600 font-medium">{customer.company}</span>
                                <span className="hidden md:inline mx-1 text-slate-300">|</span>
                                {getStatusBadge(customer.status)}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Details</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <Mail className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm md:text-base text-slate-900 font-medium break-all">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Phone Number</p>
                                        <p className="text-sm md:text-base text-slate-900 font-medium">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Billing Address</p>
                                        <p className="text-sm md:text-base text-slate-900 font-medium">{customer.address || 'No address provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Stats */}
                        <div className="space-y-6">
                            <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Account Overview</h3>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-indigo-50 p-3 md:p-4 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600" />
                                        <span className="text-[10px] md:text-xs font-bold text-indigo-600 uppercase">Total Orders</span>
                                    </div>
                                    <p className="text-xl md:text-2xl font-bold text-indigo-900">{customer.totalOrders}</p>
                                </div>
                                <div className="bg-purple-50 p-3 md:p-4 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
                                        <span className="text-[10px] md:text-xs font-bold text-purple-600 uppercase">Last Order</span>
                                    </div>
                                    <p className="text-xs md:text-sm font-bold text-purple-900 truncate">
                                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Internal Notes</span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-600 italic">
                                    {customer.notes || 'No notes available for this customer.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                    <button onClick={onClose} className="px-3 md:px-4 py-2 text-sm md:text-base bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        Close Profile
                    </button>
                    <button
                        onClick={() => onEdit(customer)}
                        className="px-3 md:px-4 py-2 text-sm md:text-base bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                    >
                        Edit Customer
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Globe, FileText, Code } from 'lucide-react';

const CompanyForm = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        legalName: '',
        email: '',
        phone: '',
        website: '',
        description: '',
        taxId: '',
        vatNumber: '',
        techStack: '', // Handle as comma-separated string for simpler editing
        headquarters: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                techStack: initialData.techStack ? initialData.techStack.join(', ') : '',
                headquarters: initialData.headquarters || { street: '', city: '', state: '', zip: '', country: '' }
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s)
        };
        onSave(submissionData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-slate-900">Edit Company Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" /> Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Legal Name</label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" /> Headquarters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="headquarters.street"
                                    value={formData.headquarters.street}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="headquarters.city"
                                    value={formData.headquarters.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="headquarters.state"
                                    value={formData.headquarters.state}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Zip Code</label>
                                <input
                                    type="text"
                                    name="headquarters.zip"
                                    value={formData.headquarters.zip}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="headquarters.country"
                                    value={formData.headquarters.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tech & Description */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Details
                        </h3>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Tech Stack (Comma separated)</label>
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="techStack"
                                    value={formData.techStack}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, Python..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                </form>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm shadow-indigo-200"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyForm;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import { Target, Search, MoreHorizontal, User, Phone, CheckCircle, ArrowRight, Plus, Edit, Trash2, XCircle } from 'lucide-react';
import ConfirmationModal from '../../../components/ConfirmationModal';
import LeadFormModal from '../components/LeadFormModal';

export default function LeadList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmConvert, setConfirmConvert] = useState({ isOpen: false, leadId: null });

    // New State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [activeDropdown, setActiveDropdown] = useState(null);

    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: mockDataService.getLeads,
    });

    const addLeadMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addLead(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            setIsAddModalOpen(false);
            setEditingLead(null);
        }
    });

    const updateLeadMutation = useMutation({
        mutationFn: ({ id, data }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateLead(id, data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            setIsAddModalOpen(false);
            setEditingLead(null);
        }
    });

    const deleteLeadMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteLead(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            setDeleteModal({ isOpen: false, id: null, name: '' });
        }
    });

    const contactMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateLead(id, { status: 'Contacted' })), 300)),
        onSuccess: () => queryClient.invalidateQueries(['leads'])
    });

    const markLostMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateLead(id, { status: 'Lost' })), 300)),
        onSuccess: () => queryClient.invalidateQueries(['leads'])
    });

    const convertMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.convertLead(id)), 500)),
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            queryClient.invalidateQueries(['customers']);
            setConfirmConvert({ isOpen: false, leadId: null });
        }
    });

    const handleFormSubmit = (data) => {
        if (editingLead) {
            updateLeadMutation.mutate({ id: editingLead.id, data });
        } else {
            addLeadMutation.mutate(data);
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredLeads = leads?.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-50 text-blue-700';
            case 'Contacted': return 'bg-purple-50 text-purple-700';
            case 'Qualified': return 'bg-emerald-50 text-emerald-700';
            case 'Lost': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading leads...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationModal
                isOpen={confirmConvert.isOpen}
                onClose={() => setConfirmConvert({ isOpen: false, leadId: null })}
                onConfirm={() => convertMutation.mutate(confirmConvert.leadId)}
                title="Convert Lead"
                message="Are you sure you want to convert this lead to a customer? This will remove the lead and create a new active customer record."
                confirmText="Convert to Customer"
                variant="primary"
            />

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Leads</h2>
                        <p className="text-slate-500 text-sm">Track and convert potential customers</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLead(null);
                            setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Lead
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads?.map(lead => (
                        <div key={lead.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{lead.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{lead.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                    <div className="relative" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === lead.id ? null : lead.id)}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === lead.id && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setEditingLead(lead);
                                                        setIsAddModalOpen(true);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                                {lead.status !== 'Lost' && (
                                                    <button
                                                        onClick={() => {
                                                            markLostMutation.mutate(lead.id);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Mark Lost
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setDeleteModal({ isOpen: true, id: lead.id, name: lead.name });
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                <div className="text-sm flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Source</span>
                                    <span className="font-bold text-slate-700">{lead.source}</span>
                                </div>
                                <div className="text-sm flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Est. Value</span>
                                    <span className="font-bold text-slate-900 text-base">${lead.value.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => contactMutation.mutate(lead.id)}
                                    disabled={lead.status !== 'New'}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2
                                        ${lead.status === 'New'
                                            ? 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            : 'bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <Phone className="w-4 h-4" />
                                    {lead.status === 'New' ? 'Contact' : 'Contacted'}
                                </button>
                                <button
                                    onClick={() => setConfirmConvert({ isOpen: true, leadId: lead.id })}
                                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
                                >
                                    <span>Convert</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredLeads?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No leads found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <LeadFormModal
                isOpen={isAddModalOpen}
                initialData={editingLead}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingLead(null);
                }}
                onSubmit={handleFormSubmit}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteLeadMutation.mutate(deleteModal.id)}
                title="Delete Lead?"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete Lead"
                variant="danger"
            />
        </div >
    );
}

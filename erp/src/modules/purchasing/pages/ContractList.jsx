import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Calendar,
    Download,
    MoreVertical
} from 'lucide-react';


// Using static mock data for simplified Contracts list as requested
const MOCK_CONTRACTS = [
    { id: 1, title: 'Annual Supply Agreement', party: 'TechGiant Corp', type: 'Supplier', date: '2024-01-15', status: 'Active' },
    { id: 2, title: 'Office Lease - Downtown', party: 'RealEstate Ltd', type: 'Lease', date: '2023-11-01', status: 'Active' },
    { id: 3, title: 'Maintenance Contract', party: 'FixIt Services', type: 'Service', date: '2024-03-10', status: 'Draft' },
    { id: 4, title: 'Consulting Agreement', party: 'Jane Doe', type: 'Employment', date: '2024-02-20', status: 'Expired' },
];

export default function ContractList() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContracts = MOCK_CONTRACTS.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.party.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Draft': return 'bg-blue-100 text-blue-700';
            case 'Expired': return 'bg-slate-100 text-slate-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Contracts</h2>
                        <p className="text-slate-500 text-sm">Manage legal agreements and documents</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Contract
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContracts.map((contract) => (
                        <div key={contract.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative">
                            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{contract.title}</h3>
                                    <p className="text-xs text-slate-500">ID: CN-{contract.id + 1000}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Party</span>
                                    <span className="font-medium text-slate-900">{contract.party}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date</span>
                                    <div className="flex items-center gap-1 text-slate-900">
                                        <Calendar className="w-3 h-3" />
                                        <span>{contract.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(contract.status)}`}>
                                    {contract.status}
                                </span>
                                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

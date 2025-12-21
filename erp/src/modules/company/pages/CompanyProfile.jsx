import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import CompanyForm from '../components/CompanyForm';
import {
    Globe,
    Code,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    ShieldCheck,
    Linkedin,
    Github,
    Edit3,
    CheckCircle2
} from 'lucide-react';

export default function CompanyProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const { data: company, isLoading } = useQuery({
        queryKey: ['company-profile'],
        queryFn: mockDataService.getCompanyProfile,
    });

    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) => {
            return new Promise(resolve => {
                resolve(mockDataService.updateCompanyProfile(updatedData));
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['company-profile']);
            setIsEditing(false);
        }
    });

    const handleSave = (updatedData) => {
        updateProfileMutation.mutate(updatedData);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header / Hero Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-indigo-900 to-slate-900 relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit Profile</span>
                            </button>
                        </div>
                    </div>
                    <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">

                            {/* Avatar - Pulled up to overlap banner */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-100 shrink-0 -mt-12 md:-mt-16 z-10 relative">
                                <img
                                    src={company.logo}
                                    alt="Logo"
                                    className="w-full h-full object-cover rounded-xl bg-slate-50"
                                />
                            </div>

                            {/* Text Content - Stays on white background */}
                            <div className="flex-1 min-w-0 pt-2 md:pt-4">
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 mb-2 justify-center md:justify-start">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{company.name}</h1>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded border border-blue-100 flex items-center gap-1 shrink-0">
                                        <CheckCircle2 className="w-3 h-3" /> Verified Business
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto md:mx-0 leading-relaxed">
                                    {company.description}
                                </p>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-2 shrink-0 md:pt-4">
                                <a href={`https://${company.socials.linkedin}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 hover:bg-[#0077b5] hover:text-white text-slate-600 rounded-lg transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href={`https://${company.socials.github}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-lg transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg transition-all">
                                    <Globe className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Contact & Location */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" /> Contact Details
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>{company.email}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>{company.phone}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>
                                        {company.headquarters.street}<br />
                                        {company.headquarters.city}, {company.headquarters.state} {company.headquarters.zip}<br />
                                        {company.headquarters.country}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-slate-400" /> Legal Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500">Legal Name</p>
                                    <p className="font-medium text-slate-900">{company.legalName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Tax ID / EIN</p>
                                        <p className="font-mono text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">
                                            {company.taxId}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">VAT Number</p>
                                        <p className="font-mono text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">
                                            {company.vatNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Global Ops & Tech (Spans 2 cols) */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Global Ecommerce Operations */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-slate-400" /> Global Operations
                                </h3>
                                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
                                    Active for Trading
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Operating Regions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {company.operatingRegions.map(region => (
                                            <span key={region} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md font-medium">
                                                {region}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-2">Supported Currencies</p>
                                    <div className="flex gap-2">
                                        {company.currencies.map(curr => (
                                            <span key={curr} className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                                                {curr}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tech Stack & Dev */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Code className="w-4 h-4 text-slate-400" /> Technology Stack
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Strategic deployment of modern frameworks for our internal ERP and D2C e-commerce platforms.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {company.techStack.map(tech => (
                                    <span key={tech} className="px-3 py-1.5 bg-slate-900 text-slate-50 text-xs font-mono rounded-lg border border-slate-700 shadow-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity / Integration Status */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-6">
                            <h3 className="text-sm font-bold text-indigo-900 mb-2">System Health & Integrations</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-slate-700">ERP Core: <strong>Online</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-slate-700">Payment Gateways: <strong>Connected</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-slate-700">CDN: <strong>Active</strong></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <CompanyForm
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    initialData={company}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}

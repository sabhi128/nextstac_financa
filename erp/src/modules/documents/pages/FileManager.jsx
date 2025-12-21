import React, { useState } from 'react';
import {
    File,
    FileText,
    Image as ImageIcon,
    Search,
    Upload,
    MoreVertical,
    Download,
    Trash2,
    Loader2,
    FileSpreadsheet
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import FileUploadModal from '../components/FileUploadModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, cardVariants } from '../../../components/ui/animations';
import { useToast } from '../../../context/ToastContext';

export default function FileManager() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    const { data: files, isLoading } = useQuery({
        queryKey: ['files'],
        queryFn: mockDataService.getFiles,
    });

    const addFileMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addFile(data)), 500)),
        onSuccess: () => {
            queryClient.invalidateQueries(['files']);
            setIsUploadOpen(false);
            showToast('File uploaded successfully', 'success');
        }
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteFile(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['files']);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            showToast('File deleted successfully', 'success');
        }
    });

    const handleDownload = (id, name) => {
        setDownloadingId(id);
        setTimeout(() => {
            setDownloadingId(null);
            showToast(`Downloaded ${name}`, 'success');
        }, 1000);
    };

    // Close dropdowns on click outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredFiles = files?.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center animate-pulse">Loading documents...</div>;

    const getFileIcon = (type) => {
        if (type.includes('image')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
        if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
        return <File className="w-8 h-8 text-blue-500" />;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
                    <p className="text-slate-500 mt-1">Manage and organize company files</p>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Upload className="w-5 h-5" />
                    Upload File
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                <Search className="absolute left-7 top-6.5 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full pl-10 pr-4 py-2.5 input-premium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
                {filteredFiles?.map((file, i) => (
                    <motion.div
                        key={file.id}
                        variants={cardVariants}
                        custom={i}
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center ring-1 ring-slate-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="relative" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === file.id ? null : file.id)}
                                    className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all ${activeDropdown === file.id ? 'opacity-100 bg-slate-50' : 'opacity-0 group-hover:opacity-100'}`}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === file.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl ring-1 ring-slate-900/5 z-20 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => {
                                                    setDeleteModal({ isOpen: true, id: file.id, name: file.name });
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-slate-900 truncate mb-1" title={file.name}>{file.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{file.size} • {new Date(file.date).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                    {file.uploadedBy.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]">{file.uploadedBy.split(' ')[0]}</span>
                            </div>
                            <button
                                onClick={() => handleDownload(file.id, file.name)}
                                disabled={downloadingId === file.id}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-50 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                {downloadingId === file.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>


            <FileUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSubmit={(data) => addFileMutation.mutate(data)}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={() => deleteFileMutation.mutate(deleteModal.id)}
                title="Delete File?"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete File"
                variant="danger"
            />
        </motion.div>
    );
}

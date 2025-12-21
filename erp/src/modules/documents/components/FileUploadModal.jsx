import React, { useState } from 'react';
import { X, Upload, File, FileText, Image as ImageIcon } from 'lucide-react';

export default function FileUploadModal({ isOpen, onClose, onSubmit }) {
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('application/pdf');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name: fileName,
            type: fileType,
        });
        setFileName('');
        onClose();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        // Simulate catching a file
        const file = e.dataTransfer.files[0];
        if (file) {
            setFileName(file.name);
            setFileType(file.type || 'application/pdf');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFileType(file.type || 'application/pdf');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Upload Document</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                            ${isDragging
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">File Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="report_q4.pdf"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">File Type</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                            >
                                <option value="application/pdf">PDF Document</option>
                                <option value="image/jpeg">Image (JPG/PNG)</option>
                                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Spreadsheet (XLSX)</option>
                                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (DOCX)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

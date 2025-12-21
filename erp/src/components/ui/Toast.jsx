import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
};

const borderColors = {
    success: 'border-emerald-100',
    error: 'border-red-100',
    warning: 'border-amber-100',
    info: 'border-blue-100'
};

const bgColors = {
    success: 'bg-emerald-50/80',
    error: 'bg-red-50/80',
    warning: 'bg-amber-50/80',
    info: 'bg-blue-50/80'
};

export default function Toast({ id, type = 'info', message, onClose, duration = 4000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`pointer-events-auto flex items-start w-full max-w-sm overflow-hidden rounded-xl shadow-lg border backdrop-blur-md ${bgColors[type]} ${borderColors[type]} p-4`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-slate-900">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
                <button
                    type="button"
                    className="inline-flex rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => onClose(id)}
                >
                    <span className="sr-only">Close</span>
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

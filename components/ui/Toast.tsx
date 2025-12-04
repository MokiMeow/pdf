import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: Toast['type'], message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: Toast['type'], message: string, duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const borderColors = {
        success: 'border-l-green-500',
        error: 'border-l-red-500',
        info: 'border-l-blue-500'
    };

    return (
        <div className={`glass rounded-2xl px-5 py-4 min-w-[320px] flex items-center gap-4 shadow-2xl animate-slide-up border-l-4 ${borderColors[toast.type]}`}>
            {icons[toast.type]}
            <p className="text-sm text-white flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="w-4 h-4 text-zinc-400" />
            </button>
        </div>
    );
};

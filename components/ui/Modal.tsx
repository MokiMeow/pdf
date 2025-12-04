import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative ${sizes[size]} w-full glass rounded-3xl shadow-2xl animate-in zoom-in-95 fade-in duration-300`}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

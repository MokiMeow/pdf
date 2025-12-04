import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'search' | 'ghost';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, variant = 'default', className = '', ...props }, ref) => {
        const variants = {
            default: 'input-premium',
            search: 'input-premium pl-10',
            ghost: 'bg-transparent border-transparent focus:border-zinc-700 focus:ring-0 px-0'
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {variant === 'search' && (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    )}
                    {icon && variant !== 'search' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`${variants[variant]} ${icon && variant !== 'search' ? 'pl-10' : ''} ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

import React from 'react';

interface BadgeProps {
    variant?: 'ai' | 'new' | 'pro' | 'default';
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '', icon }) => {
    const variants = {
        ai: 'badge-ai',
        new: 'badge-new',
        pro: 'badge-pro',
        default: 'px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-full'
    };

    return (
        <span className={`inline-flex items-center gap-1 ${variants[variant]} ${className}`}>
            {icon}
            {children}
        </span>
    );
};

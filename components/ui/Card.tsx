import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'interactive';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
    onClick
}) => {
    const variants = {
        default: 'bg-zinc-900/50 border border-white/5',
        glass: 'glass',
        gradient: 'card-premium',
        interactive: 'card-premium cursor-pointer hover-lift'
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// Card subcomponents
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold text-white ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-sm text-zinc-400 mt-1 ${className}`}>{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-white/5 ${className}`}>{children}</div>
);

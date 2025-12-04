import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed border-2';

    const variants = {
        primary: 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent',
        secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
        ghost: 'bg-transparent text-muted border-transparent hover:text-ink',
        danger: 'bg-error text-white border-error hover:bg-red-700 hover:border-red-700'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2'
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

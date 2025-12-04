import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1
}) => {
    const baseStyles = 'skeleton';

    const variantStyles = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl'
    };

    const style = {
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1rem' : '100%')
    };

    const items = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    ));

    return count === 1 ? items[0] : <div className="space-y-3">{items}</div>;
};

// Preset skeleton loaders
export const SkeletonCard: React.FC = () => (
    <div className="card-premium p-6">
        <div className="flex items-start gap-4">
            <Skeleton variant="rectangular" width={56} height={56} className="rounded-2xl" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={14} />
            </div>
        </div>
    </div>
);

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? '60%' : '100%'}
                height={14}
            />
        ))}
    </div>
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <Skeleton variant="circular" width={size} height={size} />
);

import React from 'react';
import { cn } from '@/lib/utils';

type UMKMLevel = 'mikro' | 'kecil' | 'menengah';

interface UMKMLevelBadgeProps {
    level: string; // Can be string from backend, we'll normalize it
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function UMKMLevelBadge({ level, className, size = 'md' }: UMKMLevelBadgeProps) {
    const normalizedLevel = level.toLowerCase() as UMKMLevel;

    const styles = {
        mikro: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        kecil: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
        menengah: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    };

    const sizeStyles = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1"
    };

    const style = styles[normalizedLevel] || styles.default;

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full border font-medium capitalize",
                style,
                sizeStyles[size],
                className
            )}
        >
            {level}
        </span>
    );
}

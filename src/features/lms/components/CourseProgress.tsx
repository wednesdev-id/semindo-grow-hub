import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseProgressProps {
    value: number;
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success';
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
    value,
    className,
    showLabel = true,
    size = 'md',
    variant = 'default'
}) => {
    return (
        <div className={cn("w-full space-y-2", className)}>
            <Progress
                value={value}
                className={cn(
                    "bg-slate-100 dark:bg-slate-800",
                    size === 'sm' && "h-1.5",
                    size === 'md' && "h-2.5",
                    size === 'lg' && "h-4",
                    variant === 'success' && "[&>div]:bg-emerald-600"
                )}
            />
            {showLabel && (
                <div className={cn(
                    "flex items-center justify-between text-muted-foreground font-medium",
                    size === 'sm' && "text-xs",
                    size === 'md' && "text-sm",
                    size === 'lg' && "text-base"
                )}>
                    <span>Progress</span>
                    <span>{Math.round(value)}%</span>
                </div>
            )}
        </div>
    );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        onClick?: () => void;
        to?: string;
    };
    secondaryAction?: {
        label: string;
        onClick?: () => void;
        to?: string;
    };
    className?: string;
    iconClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    action,
    secondaryAction,
    className,
    iconClassName,
}) => {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300", className)}>
            <div className={cn(
                "w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-primary/20",
                iconClassName
            )}>
                <Icon className="h-12 w-12 text-primary/60" />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-foreground">{title}</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                {action && (
                    action.to ? (
                        <Button size="lg" asChild className="min-w-[160px]">
                            <Link to={action.to}>{action.label}</Link>
                        </Button>
                    ) : (
                        <Button size="lg" onClick={action.onClick} className="min-w-[160px]">
                            {action.label}
                        </Button>
                    )
                )}

                {secondaryAction && (
                    secondaryAction.to ? (
                        <Button size="lg" variant="outline" asChild className="min-w-[160px]">
                            <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
                        </Button>
                    ) : (
                        <Button size="lg" variant="outline" onClick={secondaryAction.onClick} className="min-w-[160px]">
                            {secondaryAction.label}
                        </Button>
                    )
                )}
            </div>
        </div>
    );
};

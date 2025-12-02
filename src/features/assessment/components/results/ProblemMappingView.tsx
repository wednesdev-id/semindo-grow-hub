import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentifiedProblem {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
}

interface ProblemMappingViewProps {
    problems: IdentifiedProblem[];
    className?: string;
}

export default function ProblemMappingView({ problems, className }: ProblemMappingViewProps) {
    if (!problems || problems.length === 0) {
        return (
            <div className={cn("rounded-lg border border-dashed p-8 text-center", className)}>
                <p className="text-muted-foreground">Tidak ada masalah signifikan yang teridentifikasi.</p>
            </div>
        );
    }

    const severityConfig = {
        critical: {
            icon: AlertTriangle,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-200 dark:border-red-800",
            label: "Kritis"
        },
        high: {
            icon: AlertCircle,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-200 dark:border-orange-800",
            label: "Tinggi"
        },
        medium: {
            icon: Info,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-yellow-200 dark:border-yellow-800",
            label: "Sedang"
        },
        low: {
            icon: Info,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            label: "Rendah"
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-lg font-semibold text-foreground">Identifikasi Masalah</h3>
            <div className="grid gap-4">
                {problems.map((problem) => {
                    const config = severityConfig[problem.severity] || severityConfig.medium;
                    const Icon = config.icon;

                    return (
                        <div
                            key={problem.id}
                            className={cn(
                                "flex items-start gap-4 rounded-lg border p-4",
                                config.bg,
                                config.border
                            )}
                        >
                            <div className={cn("mt-0.5 shrink-0", config.color)}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={cn("font-medium", config.color)}>
                                        {problem.title}
                                    </h4>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase",
                                        config.bg,
                                        config.border,
                                        config.color
                                    )}>
                                        {config.label}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {problem.description}
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Kategori: <span className="font-medium text-foreground">{problem.category}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

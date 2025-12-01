import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
    | "default"
    | "success"
    | "warning"
    | "destructive"
    | "outline"
    | "secondary"
    | "info"
    | "pending";

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

const statusMap: Record<string, StatusVariant> = {
    active: "success",
    published: "success",
    completed: "success",
    approved: "success",
    verified: "success",
    paid: "success",

    pending: "warning",
    draft: "secondary",
    review: "warning",
    in_review: "warning",
    submitted: "info",
    unverified: "secondary",

    inactive: "destructive",
    rejected: "destructive",
    cancelled: "destructive",
    deleted: "destructive",
    blocked: "destructive",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
    // Auto-detect variant if not provided
    const detectedVariant = variant || statusMap[status.toLowerCase()] || "default";

    // Custom styles for variants that might not exist in standard shadcn badge
    const variantStyles = {
        info: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
        success: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
        destructive: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
    };

    const isCustom = ["info", "success", "warning", "destructive", "secondary"].includes(detectedVariant);

    return (
        <Badge
            variant={isCustom ? "outline" : (detectedVariant as any)}
            className={cn(
                "capitalize",
                isCustom && variantStyles[detectedVariant as keyof typeof variantStyles],
                className
            )}
        >
            {status}
        </Badge>
    );
}

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface DashboardPageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
        icon?: React.ReactNode;
    };
}

export function DashboardPageHeader({
    title,
    description,
    breadcrumbs,
    action,
}: DashboardPageHeaderProps) {
    return (
        <div className="space-y-4 mb-6">
            {breadcrumbs && (
                <nav className="flex items-center text-sm text-muted-foreground">
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && (
                    <div>
                        {action.href ? (
                            <Link to={action.href}>
                                <Button>
                                    {action.icon || <Plus className="mr-2 h-4 w-4" />}
                                    {action.label}
                                </Button>
                            </Link>
                        ) : (
                            <Button onClick={action.onClick}>
                                {action.icon || <Plus className="mr-2 h-4 w-4" />}
                                {action.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <Separator />
        </div>
    );
}

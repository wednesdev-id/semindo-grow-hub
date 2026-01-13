import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
}

export function StatsCards({ stats }: { stats: StatCardProps[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {(stat.description || stat.trend) && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.trend && (
                                    <span className={stat.trend.positive ? "text-green-500" : "text-red-500"}>
                                        {stat.trend.positive ? "+" : ""}{stat.trend.value}%
                                    </span>
                                )}
                                {" "}
                                {stat.description || stat.trend?.label}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturePreviewPageProps {
    title: string;
    description: string;
    features?: string[];
    status?: "planned" | "in-progress" | "coming-soon";
    eta?: string;
}

export default function FeaturePreviewPage({
    title,
    description,
    features = [],
    status = "coming-soon",
    eta = "Q2 2024",
}: FeaturePreviewPageProps) {
    return (
        <div className="p-6">
            <DashboardPageHeader
                title={title}
                description="This feature is currently under development."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Preview" },
                ]}
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Construction className="h-5 w-5 text-primary" />
                            Development Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <span className="font-medium">Status</span>
                            <Badge variant="secondary" className="capitalize">
                                {status.replace("-", " ")}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <span className="font-medium">Estimated Release</span>
                            <span>{eta}</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {description}
                        </p>
                        <Button className="w-full" variant="outline">
                            Notify Me When Ready <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Planned Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {features.length > 0 ? (
                            <ul className="space-y-3">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">
                                Detailed feature list is being finalized.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

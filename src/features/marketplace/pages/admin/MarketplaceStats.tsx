import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ShoppingBag, DollarSign, Package, AlertCircle } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MarketplaceStats() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await marketplaceService.getAdminStats();
                setStats([
                    {
                        title: "Total Sales",
                        value: `Rp ${data.totalSales.toLocaleString('id-ID')}`,
                        icon: DollarSign,
                        trend: data.salesTrend,
                    },
                    {
                        title: "Total Orders",
                        value: data.totalOrders.toLocaleString(),
                        icon: ShoppingBag,
                        trend: data.ordersTrend,
                    },
                    {
                        title: "Active Products",
                        value: data.activeProducts.toLocaleString(),
                        icon: Package,
                        trend: data.productsTrend,
                    },
                    {
                        title: "Pending Verification",
                        value: data.pendingVerifications.toLocaleString(),
                        icon: AlertCircle,
                        description: "products waiting review",
                        trend: data.verificationTrend,
                    },
                ]);
            } catch (error) {
                console.error("Failed to fetch marketplace stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            <DashboardPageHeader
                title="Marketplace Overview"
                description="Monitor sales performance and product listings."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace/reports" },
                    { label: "Overview" },
                ]}
            />
            <StatsCards stats={stats} />

            {/* Placeholder for charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <div className="col-span-4 border rounded-lg p-6 h-[400px] flex items-center justify-center bg-muted/10">
                    <p className="text-muted-foreground">Sales Revenue Trend (Chart)</p>
                </div>
                <div className="col-span-3 border rounded-lg p-6 h-[400px] flex items-center justify-center bg-muted/10">
                    <p className="text-muted-foreground">Top Selling Products (Chart)</p>
                </div>
            </div>
        </div>
    );
}

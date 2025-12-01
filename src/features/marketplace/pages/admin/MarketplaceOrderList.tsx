import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MarketplaceOrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await marketplaceService.getAllOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const columns = [
        {
            header: "Order ID",
            accessorKey: "id" as const,
            className: "font-medium",
        },
        {
            header: "Customer",
            accessorKey: "customer" as const,
        },
        {
            header: "Date",
            accessorKey: "date" as const,
        },
        {
            header: "Total",
            accessorKey: "total" as const,
        },
        {
            header: "Items",
            accessorKey: "items" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: any) => <StatusBadge status={item.status} />,
        },
        {
            header: "Actions",
            cell: () => (
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

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
                title="Order Management"
                description="View and manage customer orders."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace/reports" },
                    { label: "Orders" },
                ]}
            />

            <DataGrid
                data={orders}
                columns={columns}
                searchKey="id"
                searchPlaceholder="Search order ID..."
            />
        </div>
    );
}

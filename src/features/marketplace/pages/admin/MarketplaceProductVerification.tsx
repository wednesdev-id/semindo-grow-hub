import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MarketplaceProductVerification() {
    const { toast } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const data = await marketplaceService.getPendingProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch pending products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleVerify = async (id: number, approved: boolean) => {
        try {
            await marketplaceService.verifyProduct(id, approved);
            toast({
                title: approved ? "Product Approved" : "Product Rejected",
                description: `The product has been ${approved ? "approved" : "rejected"}.`,
                variant: approved ? "default" : "destructive",
            });
            // Optimistically update or refetch
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update product status.",
                variant: "destructive",
            });
        }
    };

    const columns = [
        {
            header: "Product Name",
            accessorKey: "name" as const,
            className: "font-medium",
        },
        {
            header: "Seller",
            accessorKey: "seller" as const,
        },
        {
            header: "Category",
            accessorKey: "category" as const,
        },
        {
            header: "Price",
            accessorKey: "price" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: any) => <StatusBadge status={item.status} />,
        },
        {
            header: "Submitted",
            accessorKey: "submittedAt" as const,
        },
        {
            header: "Actions",
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600"
                        onClick={() => handleVerify(item.id, true)}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleVerify(item.id, false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
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
                title="Product Verification"
                description="Review and approve new product listings."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace/reports" },
                    { label: "Verification" },
                ]}
            />

            <DataGrid
                data={products}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search products..."
            />
        </div>
    );
}

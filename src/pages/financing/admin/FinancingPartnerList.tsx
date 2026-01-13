import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { financingService, FinancingPartner } from "@/services/financingService";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function FinancingPartnerList() {
    const { toast } = useToast();
    const [partners, setPartners] = useState<FinancingPartner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPartners = async () => {
        try {
            const data = await financingService.getPartners();
            setPartners(data);
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this partner?")) return;
        try {
            await financingService.deletePartner(id);
            toast({
                title: "Partner Deleted",
                description: "The financing partner has been deleted.",
            });
            fetchPartners();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete partner.",
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
            header: "Provider",
            accessorKey: "provider" as const,
        },
        {
            header: "Type",
            accessorKey: "type" as const,
        },
        {
            header: "Max Amount",
            accessorKey: "maxAmount" as const,
        },
        {
            header: "Interest Rate",
            accessorKey: "interestRate" as const,
        },
        {
            header: "Status",
            accessorKey: "isActive" as const,
            cell: (item: FinancingPartner) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />,
        },
        {
            header: "Actions",
            cell: (item: FinancingPartner) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
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
                title="Financing Partners"
                description="Manage financial partners and loan products."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Financing", href: "/financing/partners" },
                    { label: "Partners" },
                ]}
                action={{ label: "Add Partner" }}
            />

            <DataGrid
                data={partners}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search partners..."
            />
        </div>
    );
}

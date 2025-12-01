import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { financingService, LoanApplication } from "@/services/financingService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function FinancingApplicationList() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await financingService.getAllApplications();
                setApplications(data);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const columns = [
        {
            header: "Application ID",
            accessorKey: "id" as const,
            className: "font-medium",
        },
        {
            header: "Amount",
            accessorKey: "amount" as const,
            cell: (item: LoanApplication) => `Rp ${item.amount.toLocaleString('id-ID')}`,
        },
        {
            header: "Partner",
            accessorKey: "partner" as const,
            cell: (item: LoanApplication) => item.partner.name,
        },
        {
            header: "Purpose",
            accessorKey: "purpose" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: LoanApplication) => <StatusBadge status={item.status} />,
        },
        {
            header: "Date",
            accessorKey: "createdAt" as const,
            cell: (item: LoanApplication) => new Date(item.createdAt).toLocaleDateString('id-ID'),
        },
        {
            header: "Actions",
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
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
                title="Loan Applications"
                description="Manage financing applications from UMKM."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Financing", href: "/financing/applications" },
                    { label: "Applications" },
                ]}
            />

            <DataGrid
                data={applications}
                columns={columns}
                searchKey="id"
                searchPlaceholder="Search application ID..."
            />
        </div>
    );
}

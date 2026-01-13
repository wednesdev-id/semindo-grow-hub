import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Users, Calendar } from "lucide-react";
import { programService, Program } from "@/services/programService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProgramList() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await programService.getAllPrograms();
                setPrograms(data);
            } catch (error) {
                console.error("Failed to fetch programs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    const columns = [
        {
            header: "Program Name",
            accessorKey: "title" as const,
            className: "font-medium",
        },
        {
            header: "Type",
            accessorKey: "type" as const,
            cell: (item: Program) => <span className="capitalize">{item.type}</span>,
        },
        {
            header: "Location",
            accessorKey: "location" as const,
        },
        {
            header: "Participants",
            accessorKey: "enrolledCount" as const,
            cell: (item: Program) => `${item.enrolledCount} / ${item.quota}`,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: Program) => <StatusBadge status={item.status} />,
        },
        {
            header: "Start Date",
            accessorKey: "startDate" as const,
            cell: (item: Program) => new Date(item.startDate).toLocaleDateString('id-ID'),
        },
        {
            header: "Actions",
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Calendar className="h-4 w-4" />
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
                title="Program Management"
                description="Manage training programs and events."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Programs", href: "/programs/list" },
                    { label: "List" },
                ]}
                action={{ label: "Create Program", href: "/programs/create" }}
            />

            <DataGrid
                data={programs}
                columns={columns}
                searchKey="title"
                searchPlaceholder="Search programs..."
            />
        </div>
    );
}

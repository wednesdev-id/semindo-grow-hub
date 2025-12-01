import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { lmsService } from "@/services/lmsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LMSModuleManagement() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await lmsService.getAllModules();
                setModules(data);
            } catch (error) {
                console.error("Failed to fetch modules:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, []);

    const columns = [
        {
            header: "Module Title",
            accessorKey: "title" as const,
            className: "font-medium",
        },
        {
            header: "Course",
            accessorKey: "course" as const,
        },
        {
            header: "Lessons",
            accessorKey: "lessons" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: any) => <StatusBadge status={item.status} />,
        },
        {
            header: "Last Updated",
            accessorKey: "updatedAt" as const,
        },
        {
            header: "Actions",
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
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
                title="Module Management"
                description="Manage course modules and lessons."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "LMS", href: "/lms/stats" },
                    { label: "Modules" },
                ]}
                action={{ label: "Add Module" }}
            />

            <DataGrid
                data={modules}
                columns={columns}
                searchKey="title"
                searchPlaceholder="Search modules..."
            />
        </div>
    );
}

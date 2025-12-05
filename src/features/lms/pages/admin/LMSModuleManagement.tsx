import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { lmsService, Course } from "@/services/lmsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { CreateModuleDialog } from "@/features/lms/components/CreateModuleDialog";

export default function LMSModuleManagement() {
    const { toast } = useToast();
    const [modules, setModules] = useState<any[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modulesData, coursesData] = await Promise.all([
                    lmsService.getAllModules(),
                    lmsService.getCourses()
                ]);
                setModules(modulesData);
                setCourses(coursesData || []); // coursesData is Course[] directly
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSuccess = async () => {
        // Refresh modules
        try {
            const updatedModules = await lmsService.getAllModules();
            setModules(updatedModules);
        } catch (error) {
            console.error("Failed to refresh modules:", error);
        }
    };

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
                action={{
                    label: "Add Module",
                    onClick: () => setIsDialogOpen(true)
                }}
            />

            <DataGrid
                data={modules}
                columns={columns}
                searchKey="title"
                searchPlaceholder="Search modules..."
            />

            <CreateModuleDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

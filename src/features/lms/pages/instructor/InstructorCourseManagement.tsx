import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Upload, Archive, Trash2 } from "lucide-react";
import { lmsService, Course } from "@/services/lmsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function InstructorCourseManagement() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, statsData] = await Promise.all([
                    lmsService.getInstructorCourses(),
                    lmsService.getInstructorStats()
                ]);
                setCourses(coursesData || []);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePublishToggle = async (course: Course) => {
        try {
            await lmsService.updateCourse(course.id, { isPublished: !course.isPublished });
            toast({ title: "Success", description: `Course ${course.isPublished ? 'unpublished' : 'published'} successfully` });
            // Refresh
            const updatedCourses = await lmsService.getInstructorCourses();
            const updatedStats = await lmsService.getInstructorStats();
            setCourses(updatedCourses);
            setStats(updatedStats);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update course status", variant: "destructive" });
        }
    };

    const columns = [
        {
            header: "Course Title",
            accessorKey: "title" as const,
            className: "font-medium",
        },
        {
            header: "Price",
            accessorKey: "price" as const,
            cell: (item: any) => `Rp ${Number(item.price).toLocaleString('id-ID')} `,
        },
        {
            header: "Students",
            accessorKey: "_count.enrollments" as const,
            cell: (item: any) => item._count?.enrollments || 0,
        },
        {
            header: "Status",
            accessorKey: "isPublished" as const,
            cell: (item: any) => (
                <StatusBadge
                    status={item.isPublished ? "published" : "draft"}
                    variant={item.isPublished ? "success" : "secondary"}
                />
            ),
        },
        {
            header: "Actions",
            cell: (item: Course) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/lms/courses/${item.slug}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/lms/courses/${item.slug}/edit`)}>
                        <Edit className="h-4 w-4" />
                    </Button >
                    <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div >
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
        <div className="p-6 space-y-6">
            <DashboardPageHeader
                title="Manajemen Kelas"
                description="Kelola kelas, materi, dan pantau performa penjualan Anda."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "LMS", href: "/lms" },
                    { label: "Manajemen Kelas" },
                ]}
                action={{
                    label: "Buat Kelas Baru",
                    onClick: () => navigate('/lms/admin/create')
                }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Potongan Komisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats?.deductionPercentage || 0}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.totalCourses >= 5
                                ? "Tier Premium (15%)"
                                : `Tier Standar (30%) - Buat ${5 - stats?.totalCourses} kelas lagi untuk diskon komisi!`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimasi Pendapatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{(100 - (stats?.deductionPercentage || 0))}%</div>
                        <p className="text-xs text-muted-foreground mt-1">dari total penjualan</p>
                    </CardContent>
                </Card>
            </div>

            <DataGrid
                data={courses}
                columns={columns}
                searchKey="title"
                searchPlaceholder="Cari kelas..."
            />
        </div>
    );
}

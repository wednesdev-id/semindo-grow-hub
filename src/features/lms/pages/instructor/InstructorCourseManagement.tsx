import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Users,
    TrendingDown,
    TrendingUp,
    Edit,
    Eye,
    Trash2,
    Plus,
    BookOpen,
    Clock,
    DollarSign
} from "lucide-react";
import { lmsService, Course } from "@/services/lmsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InstructorCourseManagement() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleDeleteClick = (course: Course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!courseToDelete) return;

        try {
            await lmsService.deleteCourse(courseToDelete.id);
            toast({ title: "Success", description: "Course deleted successfully" });
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const tierInfo = stats?.totalCourses >= 5
        ? { tier: "Premium", rate: 15, color: "text-purple-600" }
        : { tier: "Standar", rate: 30, color: "text-orange-600" };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <DashboardPageHeader
                        title="Manajemen Kelas"
                        description="Kelola kelas, materi, dan pantau performa penjualan Anda."
                        breadcrumbs={[
                            { label: "Dashboard", href: "/dashboard" },
                            { label: "LMS", href: "/lms/catalog" },
                            { label: "Manajemen Kelas" },
                        ]}
                    />

                    <Button
                        onClick={() => navigate('/lms/admin/create')}
                        size="lg"
                        className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Buat Kelas Baru
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Kelas
                                </CardTitle>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.totalCourses || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Course yang dibuat
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Siswa
                                </CardTitle>
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Siswa terdaftar
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Potongan Komisi
                                </CardTitle>
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${tierInfo.color}`}>
                                {stats?.deductionPercentage || 0}%
                            </div>
                            <div className="mt-2">
                                <Badge variant={tierInfo.tier === "Premium" ? "default" : "secondary"} className="text-xs">
                                    Tier {tierInfo.tier}
                                </Badge>
                            </div>
                            {tierInfo.tier === "Standar" && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Buat {5 - (stats?.totalCourses || 0)} kelas lagi untuk tier Premium (15%)
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pendapatan Anda
                                </CardTitle>
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {(100 - (stats?.deductionPercentage || 0))}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                dari total penjualan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Cards */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Kelas Anda</h2>
                        <Badge variant="outline" className="text-sm">
                            {courses.length} Kelas
                        </Badge>
                    </div>

                    {courses.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                    <GraduationCap className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Belum ada kelas</h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-md">
                                    Mulai berbagi pengetahuan Anda dengan membuat kelas pertama!
                                </p>
                                <Button onClick={() => navigate('/lms/admin/create')} size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Buat Kelas Pertama
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {courses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/50"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="h-16 w-16 text-primary/20" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <Badge
                                                variant={course.isPublished ? "default" : "secondary"}
                                                className="shadow-lg"
                                            >
                                                {course.isPublished ? "Published" : "Draft"}
                                            </Badge>
                                        </div>

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge variant="outline" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                                                {course.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {course.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course._count?.enrollments || 0} siswa</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{course._count?.modules || 0} modul</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Price */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Harga:</span>
                                            <span className="text-lg font-bold text-primary">
                                                {course.price === 0 ? "Gratis" : `Rp ${Number(course.price).toLocaleString('id-ID')}`}
                                            </span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/lms/courses/${course.slug}`)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/lms/courses/${course.slug}/edit`)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteClick(course)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus kelas "{courseToDelete?.title}"?
                                Tindakan ini tidak dapat dibatalkan dan semua data termasuk modul, lesson,
                                dan enrollment akan ikut terhapus.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

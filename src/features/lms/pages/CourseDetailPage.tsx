import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, CheckCircle2, Clock, BookOpen, Award, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function CourseDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { hasRole } = useAuth();
    const queryClient = useQueryClient();

    const { data: course, isLoading } = useQuery({
        queryKey: ["course", slug],
        queryFn: () => lmsService.getCourseBySlug(slug || ""),
        enabled: !!slug,
    });

    const enrollMutation = useMutation({
        mutationFn: (courseId: string) => lmsService.enroll(courseId),
        onSuccess: () => {
            toast({
                title: "Berhasil Mendaftar",
                description: "Selamat belajar! Anda telah terdaftar di kelas ini.",
            });
            navigate(`/lms/learn/${slug}`);
        },
        onError: (error: any) => {
            // If already enrolled, just navigate
            if (error?.response?.status === 400 && error?.response?.data?.message?.includes('already enrolled')) {
                navigate(`/lms/learn/${slug}`);
                return;
            }

            if (error?.response?.status === 401) {
                toast({
                    title: "Login Diperlukan",
                    description: "Silakan login terlebih dahulu untuk mendaftar kelas.",
                    variant: "destructive",
                });
                navigate('/login', { state: { from: `/lms/courses/${slug}` } });
                return;
            }

            toast({
                title: "Gagal Mendaftar",
                description: "Terjadi kesalahan saat mendaftar kelas. Silakan coba lagi.",
                variant: "destructive",
            });
        }
    });

    const handleEnroll = () => {
        if (course) {
            enrollMutation.mutate(course.id);
        }
    };

    if (isLoading) {
        return <div className="container py-10 space-y-8">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        </div>;
    }

    if (!course) {
        return <div className="container py-20 text-center">Course not found</div>;
    }

    const totalLessons = course.modules?.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
    const totalDuration = course.modules?.reduce((acc, module) =>
        acc + module.lessons.reduce((lAcc, lesson) => lAcc + (lesson.duration || 0), 0), 0
    ) || 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-16">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex gap-2">
                                <Badge variant="secondary">{course.category}</Badge>
                                <Badge variant="outline" className="text-white border-white/20">{course.level}</Badge>
                            </div>
                            <h1 className="text-4xl font-bold">{course.title}</h1>
                            <p className="text-lg text-slate-300">{course.description}</p>

                            <div className="flex items-center gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {course.author.fullName}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {totalDuration} menit
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {totalLessons} pelajaran
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Tentang Kelas Ini</h2>
                            <div className="prose max-w-none">
                                <p>{course.description}</p>
                                {/* Add more detailed description if available */}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Kurikulum</h2>
                            <div className="space-y-4">
                                {course.modules?.map((module, index) => (
                                    <Card key={module.id}>
                                        <CardContent className="p-6">
                                            <h3 className="font-semibold text-lg mb-4">
                                                Modul {index + 1}: {module.title}
                                            </h3>
                                            <div className="space-y-3">
                                                {module.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <PlayCircle className="w-5 h-5 text-primary" />
                                                            <span>{lesson.title}</span>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {lesson.duration}m
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6 sticky top-24">
                            <div className="aspect-video bg-slate-100 rounded-lg mb-6 overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <PlayCircle className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">
                                        {course.price === 0 ? "Gratis" : `Rp ${course.price.toLocaleString('id-ID')}`}
                                    </span>
                                    {course.price > 0 && (
                                        <span className="text-sm text-muted-foreground">
                                            (Total harga yang akan dibayar)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleEnroll}
                                    disabled={enrollMutation.isPending}
                                >
                                    {enrollMutation.isPending ? "Mendaftar..." : "Mulai Belajar Sekarang"}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Akses selamanya ke semua materi
                                </p>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <h4 className="font-semibold">Yang akan Anda dapatkan:</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>Akses penuh seumur hidup</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>Akses di perangkat mobile</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <Award className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>Sertifikat penyelesaian</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

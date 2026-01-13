import { useQuery } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import CourseCard from "../components/CourseCard";
import { Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MyCoursesPage() {
    const { data: enrollments, isLoading } = useQuery({
        queryKey: ["my-courses"],
        queryFn: () => lmsService.getMyCourses(),
    });

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelas Saya</h1>
                    <p className="text-muted-foreground mt-1">
                        Lanjutkan pembelajaran Anda.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link to="/lms/catalog">Cari Kelas Lain</Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : enrollments && enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {enrollments.map((enrollment: any) => (
                        <CourseCard
                            key={enrollment.course.id}
                            id={enrollment.course.id}
                            title={enrollment.course.title}
                            slug={enrollment.course.slug}
                            description={enrollment.course.description}
                            thumbnailUrl={enrollment.course.thumbnailUrl}
                            level={enrollment.course.level}
                            category={enrollment.course.category}
                            price={enrollment.course.price}
                            author={enrollment.course.author}
                            moduleCount={enrollment.course._count?.modules || 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-background rounded-full shadow-sm">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">Belum ada kelas</h3>
                            <p className="text-muted-foreground">
                                Anda belum mendaftar di kelas manapun.
                            </p>
                        </div>
                        <Button asChild className="mt-4">
                            <Link to="/lms/catalog">Mulai Belajar</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

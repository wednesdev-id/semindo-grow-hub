import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import VideoPlayer from "@/components/lms/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonView() {
    const { slug, lessonId } = useParams();

    const { data: course, isLoading } = useQuery({
        queryKey: ["course", slug],
        queryFn: () => lmsService.getCourseBySlug(slug || ""),
        enabled: !!slug,
    });

    if (isLoading) {
        return <div className="p-8 space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
        </div>;
    }

    if (!course) return <div>Course not found</div>;

    // Find current lesson
    // Note: In a real app, we might fetch just the lesson details or use a flattened list
    // For now, we find it in the course structure
    let currentLesson = null;
    let nextLessonId = null;
    let prevLessonId = null;

    // Flatten lessons for easier navigation
    const allLessons = course.modules?.flatMap(m => m.lessons) || [];
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);

    if (currentIndex !== -1) {
        currentLesson = allLessons[currentIndex];
        prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
        nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;
    } else if (allLessons.length > 0) {
        // Default to first lesson if no ID provided or not found
        currentLesson = allLessons[0];
        nextLessonId = allLessons.length > 1 ? allLessons[1].id : null;
    }

    if (!currentLesson) return <div>Lesson not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>

                {currentLesson.videoUrl ? (
                    <VideoPlayer
                        src={currentLesson.videoUrl}
                        className="w-full shadow-lg"
                        onComplete={() => {
                            console.log("Lesson completed");
                            // Handle completion logic here
                        }}
                    />
                ) : (
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-muted-foreground">
                        No video content available
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
                <Button
                    variant="outline"
                    disabled={!prevLessonId}
                    onClick={() => {
                        // Navigation logic would go here
                    }}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Sebelumnya
                </Button>

                <Button
                    disabled={!nextLessonId}
                    onClick={() => {
                        // Navigation logic would go here
                    }}
                >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <div className="prose max-w-none">
                <h3>Deskripsi Materi</h3>
                <p>{currentLesson.content || "Tidak ada deskripsi tertulis untuk materi ini."}</p>
            </div>
        </div>
    );
}

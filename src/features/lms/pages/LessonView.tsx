import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import { ResourcePlayer } from "../components/ResourcePlayer";
import { QuizPlayer } from "../components/QuizPlayer";
import { QuizBuilder } from "../components/QuizBuilder";
import { AssignmentUpload } from "../components/AssignmentUpload";
import { GradingInterface } from "../components/GradingInterface";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, UserCog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function LessonView() {
    const { slug, lessonId } = useParams();
    const [isInstructor, setIsInstructor] = useState(false); // Mock role for dev

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
        currentLesson = allLessons[0];
        nextLessonId = allLessons.length > 1 ? allLessons[1].id : null;
    }

    if (!currentLesson) return <div>Lesson not found</div>;

    const renderContent = () => {
        switch (currentLesson.type) {
            case 'quiz':
                return isInstructor ? (
                    <QuizBuilder
                        lessonId={currentLesson.id}
                        onSave={() => { /* Refresh or toast */ }}
                    />
                ) : (
                    <QuizPlayer
                        lessonId={currentLesson.id}
                        onComplete={(passed) => {
                            if (passed && nextLessonId) {
                                // Optional: Auto advance
                            }
                        }}
                    />
                );
            case 'assignment':
                return isInstructor ? (
                    <GradingInterface assignmentId={currentLesson.id} /> // Assuming lessonId is linked to assignment
                ) : (
                    <AssignmentUpload lessonId={currentLesson.id} />
                );
            default:
                return (
                    <ResourcePlayer
                        type={currentLesson.type || 'video'}
                        url={currentLesson.resourceUrl || currentLesson.videoUrl}
                        content={currentLesson.content}
                        title={currentLesson.title}
                    />
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-end items-center gap-2 mb-4">
                <Label htmlFor="role-mode" className="text-xs text-muted-foreground">Dev Mode: Instructor View</Label>
                <Switch
                    id="role-mode"
                    checked={isInstructor}
                    onCheckedChange={setIsInstructor}
                />
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                {renderContent()}
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
                <Button
                    variant="outline"
                    disabled={!prevLessonId}
                    onClick={() => {
                        // Navigation logic would go here
                        // navigate(`/lms/courses/${slug}/lessons/${prevLessonId}`)
                    }}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Sebelumnya
                </Button>

                <Button
                    disabled={!nextLessonId}
                    onClick={() => {
                        // Navigation logic would go here
                        // navigate(`/lms/courses/${slug}/lessons/${nextLessonId}`)
                    }}
                >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {currentLesson.type !== 'article' && currentLesson.type !== 'quiz' && currentLesson.type !== 'assignment' && (
                <div className="prose max-w-none">
                    <h3>Deskripsi Materi</h3>
                    <p>{currentLesson.content || "Tidak ada deskripsi tertulis untuk materi ini."}</p>
                </div>
            )}
        </div>
    );
}

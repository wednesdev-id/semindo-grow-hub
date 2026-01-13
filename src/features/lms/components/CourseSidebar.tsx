import { Link } from 'react-router-dom';
import { ChevronLeft, X, PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Course } from '@/services/lmsService';

interface CourseSidebarProps {
    course: Course | undefined;
    isOpen: boolean;
    onClose: () => void;
    currentLessonId?: string;
}

export default function CourseSidebar({ course, isOpen, onClose, currentLessonId }: CourseSidebarProps) {
    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                !isOpen && "-translate-x-full md:hidden"
            )}
        >
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                    <Link to="/lms/catalog" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Kembali
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4 border-b">
                    <h2 className="font-semibold line-clamp-2">{course?.title || 'Loading...'}</h2>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[0%]" /> {/* Progress bar placeholder */}
                        </div>
                        <span className="ml-2">0%</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {course?.modules?.map((module, moduleIndex) => (
                            <div key={module.id} className="space-y-2">
                                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                    Modul {moduleIndex + 1}: {module.title}
                                </h3>
                                <div className="space-y-1">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <button
                                            key={lesson.id}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 text-sm rounded-md hover:bg-accent text-left transition-colors",
                                                currentLessonId === lesson.id && "bg-accent text-accent-foreground"
                                            )}
                                        >
                                            {/* Status Icon */}
                                            <div className="text-muted-foreground">
                                                <PlayCircle className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 line-clamp-2">
                                                {lessonIndex + 1}. {lesson.title}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {lesson.duration}m
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </aside>
    );
}

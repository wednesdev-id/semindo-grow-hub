import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, GripVertical, FileText, Video, Link as LinkIcon, HelpCircle } from "lucide-react";
import { lmsService, Module, Lesson } from "@/services/lmsService";
import { useToast } from "@/components/ui/use-toast";
import { CreateModuleDialog } from "@/features/lms/components/CreateModuleDialog";
import { AddLessonDialog } from "@/features/lms/components/AddLessonDialog";
import { Badge } from "@/components/ui/badge";

interface CourseCurriculumProps {
    courseId: string;
}

export function CourseCurriculum({ courseId }: CourseCurriculumProps) {
    const { toast } = useToast();
    const [modules, setModules] = useState<Module[]>([]);
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const fetchModules = async () => {
        try {
            const data = await lmsService.getModules(courseId);
            setModules(data);
        } catch (error) {
            console.error("Failed to fetch modules:", error);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [courseId]);

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Are you sure you want to delete this module?")) return;
        try {
            await lmsService.deleteModule(moduleId);
            fetchModules();
            toast({ title: "Success", description: "Module deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete module", variant: "destructive" });
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await lmsService.deleteLesson(lessonId);
            fetchModules();
            toast({ title: "Success", description: "Lesson deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
        }
    };

    const handleAddLesson = (moduleId: string) => {
        setSelectedModuleId(moduleId);
        setEditingLesson(null);
        setIsLessonDialogOpen(true);
    };

    const handleEditLesson = (lesson: Lesson, moduleId: string) => {
        setSelectedModuleId(moduleId);
        setEditingLesson(lesson);
        setIsLessonDialogOpen(true);
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'pdf': return <FileText className="h-4 w-4" />;
            case 'link': return <LinkIcon className="h-4 w-4" />;
            case 'quiz': return <HelpCircle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Modules & Lessons</h3>
                <Button onClick={() => setIsModuleDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {modules.map((module) => (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                        <div className="flex items-center justify-between py-2">
                            <AccordionTrigger className="hover:no-underline py-2">
                                <span className="font-medium text-left">{module.title}</span>
                            </AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleAddLesson(module.id); }}>
                                    <Plus className="h-4 w-4 mr-1" /> Lesson
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); /* Edit Module */ }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <AccordionContent className="pt-2 pb-4 space-y-2">
                            {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md group">
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                            {getLessonIcon(lesson.type)}
                                            <span className="text-sm font-medium">{lesson.title}</span>
                                            <Badge variant="outline" className="text-xs capitalize">{lesson.type}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditLesson(lesson, module.id)}>
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    No lessons in this module. Click "Add Lesson" to start.
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <CreateModuleDialog
                open={isModuleDialogOpen}
                onOpenChange={setIsModuleDialogOpen}
                onSuccess={fetchModules}
                courseId={courseId}
            />

            <AddLessonDialog
                open={isLessonDialogOpen}
                onOpenChange={setIsLessonDialogOpen}
                onSuccess={fetchModules}
                moduleId={selectedModuleId}
                lesson={editingLesson}
            />
        </div>
    );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { lmsService, Course } from "@/services/lmsService";

interface CreateModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string;
    onSuccess?: () => void;
}

export function CreateModuleDialog({ open, onOpenChange, courseId, onSuccess }: CreateModuleDialogProps) {
    const { toast } = useToast();
    const [creating, setCreating] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        courseId: courseId || "",
        order: 1
    });

    useEffect(() => {
        if (open && !courseId) {
            // Fetch courses if not provided
            lmsService.getCourses().then((data) => {
                setCourses(data || []);
            }).catch((err) => {
                console.error("Failed to fetch courses:", err);
            });
        }
    }, [open, courseId]);

    useEffect(() => {
        if (courseId) {
            setFormData(prev => ({ ...prev, courseId }));
        }
    }, [courseId]);

    const handleCreate = async () => {
        if (!formData.title || !formData.courseId) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        setCreating(true);
        try {
            await lmsService.createModule(formData.courseId, {
                title: formData.title,
                order: Number(formData.order)
            });

            toast({ title: "Success", description: "Module created successfully" });
            onOpenChange(false);
            setFormData({ title: "", courseId: courseId || "", order: 1 });
            onSuccess?.();
        } catch (error) {
            console.error("Failed to create module:", error);
            toast({ title: "Error", description: "Failed to create module", variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Module</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {!courseId && (
                        <div className="space-y-2">
                            <Label htmlFor="course">Course</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="title">Module Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Introduction to Marketing"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order">Order</Label>
                        <Input
                            id="order"
                            type="number"
                            min="1"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>
                        {creating ? <LoadingSpinner className="mr-2" /> : 'Create Module'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

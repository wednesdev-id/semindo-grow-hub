import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lmsService, Lesson } from "@/services/lmsService";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizEditor } from "./QuizEditor";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { VideoPreview } from "@/components/media/VideoPreview";

interface AddLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    moduleId: string | null;
    lesson: Lesson | null;
}

export function AddLessonDialog({ open, onOpenChange, onSuccess, moduleId, lesson }: AddLessonDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<string>("video");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [resourceUrl, setResourceUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isFree, setIsFree] = useState(false);

    useEffect(() => {
        if (lesson) {
            setType(lesson.type);
            setTitle(lesson.title);
            setContent(lesson.content || "");
            setVideoUrl(lesson.videoUrl || "");
            setResourceUrl(lesson.resourceUrl || "");
            setDuration(lesson.duration || 0);
            setIsFree(lesson.isFree);
        } else {
            // Reset form
            setType("video");
            setTitle("");
            setContent("");
            setVideoUrl("");
            setResourceUrl("");
            setDuration(0);
            setIsFree(false);
        }
    }, [lesson, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleId && !lesson) return;

        setLoading(true);
        try {
            const data = {
                title,
                type,
                content,
                videoUrl: type === 'video' ? videoUrl : undefined,
                resourceUrl: (type === 'pdf' || type === 'link' || type === 'slide') ? resourceUrl : undefined,
                duration,
                isFree,
                order: lesson ? lesson.order : 0, // Backend handles order for new lessons usually
            };

            if (lesson) {
                await lmsService.updateLesson(lesson.id, data);
                toast({ title: "Success", description: "Lesson updated" });
            } else {
                await lmsService.createLesson(moduleId!, data);
                toast({ title: "Success", description: "Lesson created" });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save lesson:", error);
            toast({ title: "Error", description: "Failed to save lesson", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Lesson Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Lesson Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="pdf">PDF Document</SelectItem>
                                    <SelectItem value="article">Article / Text</SelectItem>
                                    <SelectItem value="link">External Link</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {type === "video" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Video Source</Label>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="videoUrl" className="text-xs text-muted-foreground">Video URL (YouTube/Vimeo)</Label>
                                        <Input
                                            id="videoUrl"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://youtube.com/..."
                                            disabled={uploading}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="videoUpload" className="text-xs text-muted-foreground">Or Upload Video (MP4/WebM)</Label>
                                        <Input
                                            id="videoUpload"
                                            type="file"
                                            accept="video/mp4,video/webm"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploading(true);
                                                try {
                                                    const res = await lmsService.uploadResource(file);
                                                    setVideoUrl(res.url);
                                                    toast({ title: "Success", description: "Video uploaded successfully" });
                                                } catch (err) {
                                                    console.error(err);
                                                    toast({ title: "Error", description: "Failed to upload video", variant: "destructive" });
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {uploading && <p className="text-sm text-muted-foreground animate-pulse">Uploading video...</p>}
                                {videoUrl && !uploading && (
                                    <div className="mt-4">
                                        <Label className="mb-2 block">Preview</Label>
                                        <VideoPreview url={videoUrl} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {type === "article" && (
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Write your article content here..."
                            />
                        </div>
                    )}

                    {(type === "pdf" || type === "link") && (
                        <div className="space-y-2">
                            <Label htmlFor="resourceUrl">{type === "link" ? "External Link URL" : "Resource URL / Upload"}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="resourceUrl"
                                    value={resourceUrl}
                                    onChange={(e) => setResourceUrl(e.target.value)}
                                    placeholder={type === "pdf" ? "URL to PDF file" : "External link URL"}
                                    disabled={uploading}
                                />
                                {type === "pdf" && (
                                    <div className="w-1/3">
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploading(true);
                                                try {
                                                    const res = await lmsService.uploadResource(file);
                                                    setResourceUrl(res.url);
                                                    toast({ title: "Success", description: "PDF uploaded successfully" });
                                                } catch (err) {
                                                    console.error(err);
                                                    toast({ title: "Error", description: "Failed to upload PDF", variant: "destructive" });
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {uploading && <p className="text-sm text-muted-foreground animate-pulse">Uploading file...</p>}
                        </div>
                    )}

                    {type === "quiz" && lesson && (
                        <div className="border rounded-md p-4">
                            <h4 className="mb-4 font-medium">Quiz Questions</h4>
                            <QuizEditor lessonId={lesson.id} />
                        </div>
                    )}

                    {type === "quiz" && !lesson && (
                        <div className="p-4 bg-muted rounded-md text-center text-sm text-muted-foreground">
                            You can add questions after creating the lesson.
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isFree"
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isFree">Free Preview (Accessible without enrollment)</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || uploading}>
                            {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Save Lesson
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

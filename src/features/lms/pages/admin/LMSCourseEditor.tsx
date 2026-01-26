import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lmsService, Course } from "@/services/lmsService";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseCurriculum } from "@/features/lms/components/CourseCurriculum";
import {
    Save,
    ArrowLeft,
    ShieldAlert,
    BookOpen,
    DollarSign,
    BarChart3,
    Settings as SettingsIcon,
    FileText,
    Image as ImageIcon,
    Tag,
    Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function LMSCourseEditor() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, hasRole } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!slug) return;
            try {
                const data = await lmsService.getCourseBySlug(slug);
                setCourse(data);
            } catch (error) {
                console.error("Failed to fetch course:", error);
                toast({ title: "Error", description: "Failed to load course", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [slug, toast]);

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;
        setSaving(true);
        try {
            await lmsService.updateCourse(course.id, {
                title: course.title,
                description: course.description,
                price: course.price,
                level: course.level,
                category: course.category,
                thumbnailUrl: course.thumbnailUrl || course.thumbnail,
            });
            toast({ title: "Success", description: "Course details saved successfully" });
        } catch (error) {
            console.error("Failed to save course:", error);
            toast({ title: "Error", description: "Failed to save course", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto p-6">
                    <Card className="max-w-md mx-auto mt-20">
                        <CardContent className="pt-6 text-center">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-slate-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Course not found</h2>
                            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
                            <Button onClick={() => navigate("/lms/instructor/courses")}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Courses
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Check ownership: only course author or admin can edit
    const isAdmin = hasRole('admin');
    const isOwner = course.author?.id === user?.id;
    const canEdit = isAdmin || isOwner;

    if (!canEdit) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto p-6">
                    <Card className="max-w-md mx-auto mt-20 border-destructive/20">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                                    <ShieldAlert className="h-12 w-12 text-destructive" />
                                </div>
                                <h2 className="text-2xl font-bold text-destructive mb-2">Unauthorized Access</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    You don't have permission to edit this course. Only the course author or administrators can make changes.
                                </p>
                                <div className="flex gap-3 flex-wrap justify-center">
                                    <Button onClick={() => navigate("/lms/instructor/courses")} variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to My Courses
                                    </Button>
                                    <Button onClick={() => navigate(`/lms/courses/${course.slug}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Course
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <DashboardPageHeader
                            title={course.title}
                            description="Edit course details and manage curriculum"
                            breadcrumbs={[
                                { label: "Dashboard", href: "/dashboard" },
                                { label: "My Courses", href: "/lms/instructor/courses" },
                                { label: "Edit Course" },
                            ]}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/lms/instructor/courses")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/lms/courses/${course.slug}`)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                    </div>
                </div>

                {/* Status Badge */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Course Status</p>
                                    <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                            <Badge
                                variant={course.isPublished ? "default" : "secondary"}
                                className="w-fit"
                            >
                                {course.isPublished ? "Published" : "Draft"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                        <TabsTrigger value="details" className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="curriculum" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Curriculum</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <SettingsIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-6 space-y-6">
                        <form onSubmit={handleSaveDetails} className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update course title, description, and category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Course Title *</Label>
                                        <Input
                                            id="title"
                                            value={course.title}
                                            onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                            placeholder="Enter course title"
                                            required
                                            className="text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={course.description}
                                            onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                            placeholder="Describe what students will learn..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {course.description?.length || 0} characters
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="flex items-center gap-2">
                                                <Tag className="h-4 w-4" />
                                                Category
                                            </Label>
                                            <Input
                                                id="category"
                                                value={course.category}
                                                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                                                placeholder="e.g., Programming, Design"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="level" className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" />
                                                Level
                                            </Label>
                                            <Select
                                                value={course.level}
                                                onValueChange={(value) => setCourse({ ...course, level: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing
                                    </CardTitle>
                                    <CardDescription>
                                        Set your course price (Set to 0 for free course)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Course Price (Rp)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={course.price}
                                            onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>

                                    {course.price > 0 && (
                                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                                            <CardContent className="pt-6">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Course Price:</span>
                                                        <span className="text-lg font-semibold">
                                                            Rp {course.price.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Platform Fee (15%):</span>
                                                        <span className="text-sm font-medium text-orange-600">
                                                            - Rp {(course.price * 0.15).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold">Your Earnings:</span>
                                                        <span className="text-xl font-bold text-green-600">
                                                            Rp {(course.price * 0.85).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {course.price === 0 && (
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                                ✓ This course will be free for all students
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Thumbnail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Thumbnail
                                    </CardTitle>
                                    <CardDescription>
                                        Update course thumbnail (Image)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Tabs defaultValue="url" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="url">Paste URL</TabsTrigger>
                                            <TabsTrigger value="upload">Upload Image</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="url" className="mt-4 space-y-2">
                                            <Input
                                                id="thumbnail"
                                                placeholder="https://..."
                                                value={course.thumbnailUrl || course.thumbnail || ""}
                                                onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Paste a direct link to an image.
                                            </p>
                                        </TabsContent>
                                        <TabsContent value="upload" className="mt-4 space-y-2">
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;

                                                        try {
                                                            const result = await lmsService.uploadResource(file);
                                                            setCourse({ ...course, thumbnailUrl: result.url });
                                                            toast({ title: "Upload Successful", description: "Image uploaded to S3" });
                                                        } catch (error) {
                                                            console.error("Upload failed", error);
                                                            toast({
                                                                title: "Upload Failed",
                                                                description: "Failed to upload image",
                                                                variant: "destructive"
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload an image from your device (Max 5MB).
                                            </p>
                                        </TabsContent>
                                    </Tabs>

                                    {(course.thumbnailUrl || course.thumbnail) && (
                                        <div className="mt-4 relative aspect-video rounded-md overflow-hidden bg-muted border">
                                            <img
                                                src={course.thumbnailUrl || course.thumbnail}
                                                alt="Thumbnail Preview"
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Save Button - Sticky on mobile */}
                            <div className="sticky bottom-4 z-10">
                                <Card className="shadow-xl border-2">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center gap-4">
                                            <p className="text-sm text-muted-foreground hidden sm:block">
                                                Remember to save your changes
                                            </p>
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                size="lg"
                                                className="w-full sm:w-auto shadow-lg"
                                            >
                                                {saving ? (
                                                    <>
                                                        <LoadingSpinner className="mr-2 h-4 w-4" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Curriculum Tab */}
                    <TabsContent value="curriculum" className="mt-6">
                        <CourseCurriculum courseId={course.id} />
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Settings</CardTitle>
                                <CardDescription>
                                    Advanced settings for your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed">
                                    <div className="text-center space-y-2">
                                        <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                                        <h3 className="font-semibold">Settings Coming Soon</h3>
                                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                            Publication controls, enrollment limits, certificates, and more advanced settings will be available here.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

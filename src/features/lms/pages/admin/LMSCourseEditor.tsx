import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lmsService, Course } from "@/services/lmsService";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseCurriculum } from "@/features/lms/components/CourseCurriculum";
import { Save, ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
            });
            toast({ title: "Success", description: "Course details saved" });
        } catch (error) {
            console.error("Failed to save course:", error);
            toast({ title: "Error", description: "Failed to save course", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Course not found</h2>
                    <Button onClick={() => navigate("/lms/instructor/courses")} className="mt-4">
                        Back to Courses
                    </Button>
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
            <div className="p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="rounded-full bg-destructive/10 p-4 mb-4">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-destructive mb-2">Unauthorized Access</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        You don't have permission to edit this course. Only the course author or administrators can make changes.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate("/lms/instructor/courses")} variant="outline">
                            Back to My Courses
                        </Button>
                        <Button onClick={() => navigate(`/lms/courses/${course.slug}`)}>
                            View Course
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <DashboardPageHeader
                title={`Edit Course: ${course.title}`}
                description="Manage course details and curriculum."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "My Courses", href: "/lms/instructor/courses" },
                    { label: "Edit Course" },
                ]}
                action={{
                    label: "Back",
                    icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                    onClick: () => navigate("/lms/instructor/courses")
                }}
            />

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Course Details</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveDetails} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Course Title</Label>
                                    <Input
                                        id="title"
                                        value={course.title}
                                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={course.description}
                                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                        rows={5}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Harga Kursus (Rp)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={course.price}
                                            onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                                        />
                                        {course.price && course.price > 0 && (
                                            <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-semibold">Total yang akan diterima:</span>{" "}
                                                    Rp {course.price.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    *Harga yang ditampilkan adalah harga akhir yang akan dibayar oleh peserta
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="level">Level</Label>
                                        <Input
                                            id="level"
                                            value={course.level}
                                            onChange={(e) => setCourse({ ...course, level: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="curriculum">
                    <CourseCurriculum courseId={course.id} />
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Additional settings like publication status, enrollment limits, etc.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

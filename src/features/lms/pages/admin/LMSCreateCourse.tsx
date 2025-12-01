import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { lmsService } from "@/services/lmsService";
import { useNavigate } from "react-router-dom";

export default function LMSCreateCourse() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        category: "",
        level: "",
        price: "",
        thumbnailUrl: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await lmsService.createCourse({
                ...formData,
                price: Number(formData.price),
            });
            toast({
                title: "Course Created",
                description: "The course has been successfully created.",
            });
            navigate("/lms/stats");
        } catch (error) {
            console.error("Failed to create course:", error);
            toast({
                title: "Error",
                description: "Failed to create course. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <DashboardPageHeader
                title="Create New Course"
                description="Add a new course to the learning catalog."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "LMS", href: "/lms/stats" },
                    { label: "Create Course" },
                ]}
            />

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Digital Marketing 101"
                                required
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input
                                id="slug"
                                placeholder="e.g. digital-marketing-101"
                                required
                                value={formData.slug}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what students will learn..."
                                className="min-h-[150px]"
                                required
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(value) => handleSelectChange("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="operations">Operations</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Difficulty Level</Label>
                                <Select onValueChange={(value) => handleSelectChange("level", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (IDR)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0 for free"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                                <Input
                                    id="thumbnail"
                                    placeholder="https://..."
                                    value={formData.thumbnailUrl}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" type="button" onClick={() => navigate("/lms/stats")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Course"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

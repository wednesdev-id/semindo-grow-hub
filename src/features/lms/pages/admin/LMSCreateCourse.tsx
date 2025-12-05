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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { lmsService } from "@/services/lmsService";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function LMSCreateCourse() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        category: "",
        level: "",
        price: "",
        thumbnailUrl: "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await lmsService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

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
            navigate("/lms/instructor/courses");
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
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Digital Marketing Masterclass"
                            value={formData.title}
                            onChange={handleChange}
                            required
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
                            value={formData.description}
                            onChange={handleChange}
                            className="h-32"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            {isCustomCategory ? (
                                <div className="flex gap-2">
                                    <Input
                                        id="category"
                                        placeholder="Enter new category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setIsCustomCategory(false);
                                            setFormData((prev) => ({ ...prev, category: "" }));
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    onValueChange={(value) => {
                                        if (value === "new") {
                                            setIsCustomCategory(true);
                                            setFormData((prev) => ({ ...prev, category: "" }));
                                        } else {
                                            handleSelectChange("category", value);
                                        }
                                    }}
                                    value={formData.category}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new" className="font-semibold text-primary">
                                            + Add New Category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
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
                        <Button variant="outline" type="button" onClick={() => navigate("/lms/instructor/courses")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Course"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

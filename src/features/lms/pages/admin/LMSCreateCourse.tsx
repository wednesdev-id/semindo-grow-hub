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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { lmsService } from "@/services/lmsService";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export default function LMSCreateCourse() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
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

        // Auto-generate slug from title if slug hasn't been manually edited
        if (id === 'title' && !isSlugManuallyEdited) {
            const autoSlug = generateSlug(value);
            setFormData((prev) => ({ ...prev, title: value, slug: autoSlug }));
        } else if (id === 'slug') {
            // Mark slug as manually edited when user directly edits it
            setIsSlugManuallyEdited(true);
            setFormData((prev) => ({ ...prev, [id]: value }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            {isSlugManuallyEdited && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSlugManuallyEdited(false);
                                        setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Reset to auto-generate
                                </button>
                            )}
                        </div>
                        <Input
                            id="slug"
                            placeholder="e.g. digital-marketing-101"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500">
                            {isSlugManuallyEdited
                                ? "Manual slug (will not auto-update from title)"
                                : "Auto-generated from title (editable)"}
                        </p>
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
                            <Label htmlFor="price">Harga Kursus (IDR)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0 untuk gratis"
                                value={formData.price}
                                onChange={handleChange}
                            />
                            {formData.price && Number(formData.price) > 0 && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Total yang akan diterima:</span>{" "}
                                        Rp {Number(formData.price).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        *Harga yang ditampilkan adalah harga akhir yang akan dibayar oleh peserta
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <Tabs defaultValue="url" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="url">Paste URL</TabsTrigger>
                                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                                </TabsList>
                                <TabsContent value="url" className="mt-4 space-y-2">
                                    <Input
                                        id="thumbnail"
                                        placeholder="https://..."
                                        value={formData.thumbnailUrl}
                                        onChange={handleChange}
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
                                                    // Show loading state if needed
                                                    const result = await lmsService.uploadResource(file);
                                                    setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
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

                            {formData.thumbnailUrl && (
                                <div className="mt-4 relative aspect-video rounded-md overflow-hidden bg-muted border">
                                    <img
                                        src={formData.thumbnailUrl}
                                        alt="Thumbnail Preview"
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                                        }}
                                    />
                                </div>
                            )}
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

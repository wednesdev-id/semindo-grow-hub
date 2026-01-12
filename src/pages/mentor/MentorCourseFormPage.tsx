import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lmsService, Course, Module, Lesson } from '@/services/lmsService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, GripVertical, FileText, Video, Presentation, Save, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { toast } from "sonner";
import MaterialUploader from '@/components/courses/MaterialUploader';
import { Separator } from "@/components/ui/separator";

export default function MentorCourseFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic');
    const [isLoading, setIsLoading] = useState(false);

    // Initial form state
    const [formData, setFormData] = useState<Partial<Course>>({
        title: "",
        slug: "",
        description: "",
        category: "",
        level: "beginner",
        price: 0,
        thumbnailUrl: "",
        isPublished: false,
    });

    // Fetch course data if editing
    const { data: course, isLoading: isFetching } = useQuery({
        queryKey: ['course', id],
        queryFn: () => lmsService.getCourseBySlug(id as string), // Assuming ID or Slug works, or we need to fix
        enabled: isEdit,
    });

    // Fetch modules if editing
    const { data: modules, refetch: refetchModules } = useQuery({
        queryKey: ['course-modules', id],
        queryFn: () => lmsService.getModules(id as string),
        enabled: isEdit,
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                slug: course.slug,
                description: course.description,
                category: course.category,
                level: course.level,
                price: course.price,
                thumbnailUrl: course.thumbnailUrl,
                isPublished: course.isPublished,
                // Add isUMKMOnly if exists in type
            });
        }
    }, [course]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: Partial<Course>) => lmsService.createCourse(data),
        onSuccess: (data) => {
            toast.success("Kursus berhasil dibuat!");
            navigate(`/mentor/courses/${data.id}/edit?tab=curriculum`);
        },
        onError: () => toast.error("Gagal membuat kursus")
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Course>) => lmsService.updateCourse(id as string, data),
        onSuccess: () => {
            toast.success("Kursus berhasil diperbarui!");
            queryClient.invalidateQueries({ queryKey: ['mentor-courses'] });
        },
        onError: () => toast.error("Gagal memperbarui kursus")
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEdit) {
                await updateMutation.mutateAsync(formData);
            } else {
                await createMutation.mutateAsync(formData);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeatureToggle = (feature: string) => {
        // Mock implementation for isUMKMOnly if not in types yet
        setFormData(prev => ({ ...prev, [feature]: !prev[feature as keyof Course] }));
    };

    // --- Curriculum Management ---

    const [newModuleTitle, setNewModuleTitle] = useState("");

    const addModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            await lmsService.createModule(id as string, {
                title: newModuleTitle,
                order: (modules?.length || 0) + 1
            });
            setNewModuleTitle("");
            toast.success("Modul ditambahkan");
            refetchModules();
        } catch (error) {
            toast.error("Gagal menambahkan modul");
        }
    };

    const deleteModule = async (moduleId: string) => {
        if (!confirm("Hapus modul ini dan semua materinya?")) return;
        try {
            await lmsService.deleteModule(moduleId);
            toast.success("Modul dihapus");
            refetchModules();
        } catch (error) {
            toast.error("Gagal menghapus modul");
        }
    };

    const addLesson = async (moduleId: string, type: string, url: string, title: string = "New Lesson") => {
        try {
            await lmsService.createLesson(moduleId, {
                title: title,
                type: type,
                content: url, // Or resourceUrl depending on implementation
                resourceUrl: url,
                order: 99 // Should confirm order logic
            });
            toast.success("Materi berhasil ditambahkan");
            refetchModules();
        } catch (error) {
            toast.error("Gagal menambahkan materi");
        }
    };

    if (isEdit && isFetching) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-5xl">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/mentor/courses')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit: ${formData.title}` : 'Buat Kursus Baru'}</h1>
                    <p className="text-gray-500 text-sm">
                        {isEdit ? 'Kelola informasi dan materi kursus.' : 'Mulai dengan informasi dasar kursus Anda.'}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                    <TabsTrigger value="curriculum" disabled={!isEdit}>Kurikulum</TabsTrigger>
                    <TabsTrigger value="settings" disabled={!isEdit}>Pengaturan</TabsTrigger>
                </TabsList>

                {/* --- BASIC INFO TAB --- */}
                <TabsContent value="basic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Kursus</CardTitle>
                            <CardDescription>
                                Judul, deskripsi, dan informasi utama lainnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Kursus</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Contoh: Digital Marketing untuk UMKM"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Jelaskan apa yang akan dipelajari..."
                                        className="h-32"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="marketing">Pemasaran</SelectItem>
                                                <SelectItem value="finance">Keuangan</SelectItem>
                                                <SelectItem value="operations">Operasional</SelectItem>
                                                <SelectItem value="technology">Teknologi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="level">Tingkat Kesulitan</Label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, level: val }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Pemula</SelectItem>
                                                <SelectItem value="intermediate">Menengah</SelectItem>
                                                <SelectItem value="advanced">Lanjutan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                                    <div className="flex-1">
                                        <Input
                                            id="thumbnail"
                                            value={formData.thumbnailUrl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <MaterialUploader
                                        label="Upload Thumbnail Image"
                                        accept="image/*"
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                        maxSizeMB={5}
                                    />
                                    {formData.thumbnailUrl && (
                                        <img src={formData.thumbnailUrl} alt="Preview" className="h-32 w-auto rounded-md object-cover mt-2 border" />
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEdit ? 'Simpan Perubahan' : 'Lanjut ke Kurikulum'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- CURRICULUM TAB --- */}
                <TabsContent value="curriculum">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Kurikulum Kursus</CardTitle>
                                    <CardDescription>Tambahkan modul dan materi pembelajaran.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Add Module */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nama Modul Baru (misal: Bab 1 - Pendahuluan)"
                                        value={newModuleTitle}
                                        onChange={(e) => setNewModuleTitle(e.target.value)}
                                    />
                                    <Button onClick={addModule} disabled={!newModuleTitle.trim()}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Modul
                                    </Button>
                                </div>

                                <Separator />

                                {/* Modules List */}
                                <Accordion type="multiple" className="w-full space-y-4">
                                    {modules?.map((module, index) => (
                                        <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                                            <div className="flex items-center justify-between py-2">
                                                <AccordionTrigger className="hover:no-underline text-base font-medium flex-1">
                                                    Modul {index + 1}: {module.title}
                                                </AccordionTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                                                    onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <AccordionContent className="pt-2 pb-6 space-y-4">
                                                {/* Lessons List */}
                                                <div className="space-y-2 pl-4">
                                                    {module.lessons?.map((lesson, lIndex) => (
                                                        <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border text-sm">
                                                            <div className="text-gray-400">
                                                                {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                                                                    lesson.type === 'slide' ? <Presentation className="w-4 h-4" /> :
                                                                        <FileText className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1 font-medium">{lesson.title}</div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Trash2 className="w-3 h-3 text-gray-400" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {(!module.lessons || module.lessons.length === 0) && (
                                                        <div className="text-sm text-gray-400 italic pl-2">Belum ada materi.</div>
                                                    )}
                                                </div>

                                                {/* Add Lesson Uploader */}
                                                <div className="mt-4 p-4 border border-dashed rounded-lg bg-gray-50/50">
                                                    <h4 className="text-sm font-medium mb-3">Tambah Materi Baru</h4>
                                                    <MaterialUploader
                                                        label="Upload Video, PDF, or PPT"
                                                        onUploadComplete={(url, type) => {
                                                            const fileName = url.split('/').pop() || 'Untitled Lesson';
                                                            addLesson(module.id, type, url, fileName);
                                                        }}
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>

                                {modules?.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        Belum ada modul. Mulai dengan menambahkan modul pertama.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- SETTINGS TAB --- */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Publikasi</CardTitle>
                            <CardDescription>Atur visibilitas dan akses kursus.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Diterbitkan</Label>
                                    <p className="text-sm text-gray-500">
                                        Kursus akan dapat dilihat dan diakses oleh siswa.
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isPublished}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Harga Kursus</Label>
                                    <p className="text-sm text-gray-500">
                                        Atur harga untuk kursus ini (IDR).
                                    </p>
                                </div>
                                <div className="max-w-[200px]">
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            {/* Placeholder for UMKM Only toggle if field existed */}
                            <div className="flex items-center justify-between p-4 border rounded-lg opacity-80">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Khusus UMKM Terverifikasi</Label>
                                    <p className="text-sm text-gray-500">
                                        Hanya UMKM yang sudah diverifikasi yang bisa mengakses.
                                    </p>
                                </div>
                                <Switch
                                    disabled // Enable when field is ready
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSubmit}>Simpan Pengaturan</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

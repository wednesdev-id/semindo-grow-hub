import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { lmsService, Course } from '@/services/lmsService';
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen, Users, Video, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MentorCourseListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    // Use getInstructorCourses assuming it fetches courses for the logged-in mentor/instructor
    const { data: courses, isLoading, refetch } = useQuery({
        queryKey: ['mentor-courses'],
        queryFn: () => lmsService.getInstructorCourses(),
    });

    const filteredCourses = courses?.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'published' ? course.isPublished
                : !course.isPublished;
        return matchesSearch && matchesStatus;
    });

    const publishedCount = courses?.filter(c => c.isPublished).length || 0;
    const draftCount = courses?.filter(c => !c.isPublished).length || 0;

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete course "${title}"?`)) {
            try {
                await lmsService.deleteCourse(id);
                toast.success(`Course "${title}" deleted successfully`);
                refetch();
            } catch (error) {
                console.error("Delete error:", error);
                toast.error(`Failed to delete course`);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Kursus</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Buat dan kelola materi pembelajaran untuk UMKM.
                    </p>
                </div>
                <Button onClick={() => navigate('/mentor/courses/new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Buat Kursus Baru
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kursus</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{courses?.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kursus Aktif</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{publishedCount}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Siswa</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses?.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0) || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setStatusFilter(val as any)}>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <TabsList>
                                <TabsTrigger value="all">Semua ({courses?.length || 0})</TabsTrigger>
                                <TabsTrigger value="published">Diterbitkan ({publishedCount})</TabsTrigger>
                                <TabsTrigger value="draft">Draft ({draftCount})</TabsTrigger>
                            </TabsList>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari kursus..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </Tabs>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Judul Kursus</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Materi</th>
                                <th className="px-6 py-3">Level</th>
                                <th className="px-6 py-3">Siswa</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </td>
                                </tr>
                            ) : filteredCourses && filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnailUrl ? (
                                                    <img src={course.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                        <Video className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{course.title}</div>
                                                    <div className="text-xs text-gray-500">{course.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.isPublished ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                                    Diterbitkan
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    Draft
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {course._count?.modules || 0} Modul
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize">
                                                {course.level}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {course._count?.enrollments || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/lms/courses/${course.slug}`)} title="View">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/mentor/courses/${course.id}/edit`)} title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate(`/mentor/courses/${course.id}/edit?tab=curriculum`)}>
                                                            Edit Materi
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/mentor/courses/${course.id}/edit?tab=settings`)}>
                                                            Pengaturan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(course.id, course.title)}>
                                                            Hapus
                                                            <Trash2 className="w-4 h-4 ml-auto" />
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <BookOpen className="w-12 h-12 text-gray-300" />
                                            <h3 className="text-lg font-medium text-gray-900">Belum ada kursus</h3>
                                            <p className="max-w-sm mb-4">
                                                Anda belum membuat kursus apapun. Mulai berbagi pengetahuan dengan membuat kursus pertama Anda.
                                            </p>
                                            <Button onClick={() => navigate('/mentor/courses/new')}>
                                                Buat Kursus Pertama
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { lmsService } from "@/services/lmsService";
import CourseCard from "../components/CourseCard";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export default function CourseCatalogPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [level, setLevel] = useState("all");

    const { data: courses, isLoading } = useQuery({
        queryKey: ["courses", search, category, level],
        queryFn: () =>
            lmsService.getCourses({
                search: search || undefined,
                category: category !== "all" ? category : undefined,
                level: level !== "all" ? level : undefined,
            }),
    });

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Katalog Kelas</h1>
                    <p className="text-muted-foreground mt-1">
                        Tingkatkan keahlian bisnis Anda dengan materi terkurasi.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kelas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Digital">Digital</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Level</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : courses && courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            slug={course.slug}
                            description={course.description}
                            thumbnailUrl={course.thumbnailUrl}
                            level={course.level}
                            category={course.category}
                            price={course.price}
                            author={course.author}
                            moduleCount={course._count?.modules || 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        Tidak ada kelas yang ditemukan.
                    </p>
                </div>
            )}
        </div>
    );
}

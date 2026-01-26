
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Loader2, RefreshCw } from "lucide-react";
import { templateService } from "@/services/arsipariService";
import { LetterCategory } from "@/types/arsipari";
import { Badge } from "@/components/ui/badge";
import CategoryForm from "./CategoryForm";
import { toast } from "sonner";

export default function CategoryList() {
    const [categories, setCategories] = useState<LetterCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<LetterCategory | undefined>(undefined);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await templateService.listCategories(true); // Fetch active by default
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Gagal memuat data kategori");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category: LetterCategory) => {
        setSelectedCategory(category);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(undefined);
        setFormOpen(true);
    };

    const filteredCategories = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Kategori Surat</CardTitle>
                    <CardDescription>Kelola kategori untuk pengarsipan dan penomoran surat.</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau nama kategori..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchCategories}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memuat data...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data kategori ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.code}</TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>{category.description || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={category.isActive ? "default" : "secondary"}>
                                                {category.isActive ? "Aktif" : "Nonaktif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CategoryForm
                open={formOpen}
                onOpenChange={setFormOpen}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />
        </Card>
    );
}

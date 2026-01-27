
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
import { Plus, Search, Pencil, Trash2, Loader2, RefreshCw, FileText } from "lucide-react";
import { templateService } from "@/services/arsipariService";
import { LetterTemplate } from "@/types/arsipari";
import { Badge } from "@/components/ui/badge";
import TemplateForm from "./TemplateForm";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function TemplateList() {
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await templateService.listTemplates();
            setTemplates(response.data || []);
        } catch (error) {
            console.error("Error fetching templates:", error);
            toast.error("Gagal memuat data template");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleEdit = (template: LetterTemplate) => {
        setSelectedTemplate(template);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedTemplate(undefined);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await templateService.deleteTemplate(deleteId);
            toast.success("Template berhasil dihapus");
            fetchTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            toast.error("Gagal menghapus template");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredTemplates = templates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.code.toLowerCase().includes(search.toLowerCase()) ||
            t.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Daftar Template Surat</CardTitle>
                    <CardDescription>Kelola template surat untuk pembuatan surat keluar yang konsisten.</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Template
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau nama template..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchTemplates}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Template</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Kop Default</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memuat data...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredTemplates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data template ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {template.code}
                                        </TableCell>
                                        <TableCell>{template.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{template.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {template.letterhead ? template.letterhead.name : <span className="text-muted-foreground italic">None</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={template.isActive ? "default" : "secondary"}>
                                                {template.isActive ? "Aktif" : "Nonaktif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(template)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteId(template.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <TemplateForm
                open={formOpen}
                onOpenChange={setFormOpen}
                template={selectedTemplate}
                onSuccess={fetchTemplates}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data template akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

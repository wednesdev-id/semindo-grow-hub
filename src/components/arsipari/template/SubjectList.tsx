
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
import { Plus, Search, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { letterSubjectService } from "@/services/arsipariService";
import { LetterSubject } from "@/types/arsipari";
import { Badge } from "@/components/ui/badge";
import SubjectForm from "./SubjectForm";
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

export default function SubjectList() {
    const [subjects, setSubjects] = useState<LetterSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<LetterSubject | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await letterSubjectService.list(true); // Fetch all active by default, or adjust based on requirement
            // Note: The service might need adjustment to support search param passing if not handled client-side
            // For now, let's fetch all and filter client-side if needed, or update service to support search
            // Checking service definition: it supports search query param.

            // Re-fetch with search if provided (need to update service call to support passing search)
            // Ideally we'd pass { search } to service.list() but current signature is list(isActive).
            // Let's assume for now we list all active. If we need search, we should update the service signature.
            // For this implementation, I'll filter client-side for simplicity unless data is large.

            setSubjects(response.data || []);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            toast.error("Gagal memuat data perihal");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleEdit = (subject: LetterSubject) => {
        setSelectedSubject(subject);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedSubject(undefined);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await letterSubjectService.delete(deleteId);
            toast.success("Perihal berhasil dihapus");
            fetchSubjects();
        } catch (error) {
            console.error("Error deleting subject:", error);
            toast.error("Gagal menghapus perihal");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredSubjects = subjects.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Perihal & Klasifikasi</CardTitle>
                    <CardDescription>Kelola kode klasifikasi dan perihal surat.</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Perihal
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau nama perihal..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchSubjects}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Perihal</TableHead>
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
                            ) : filteredSubjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data perihal ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-medium">{subject.code}</TableCell>
                                        <TableCell>{subject.name}</TableCell>
                                        <TableCell>{subject.description || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={subject.isActive ? "default" : "secondary"}>
                                                {subject.isActive ? "Aktif" : "Nonaktif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(subject)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteId(subject.id)}
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

            <SubjectForm
                open={formOpen}
                onOpenChange={setFormOpen}
                subject={selectedSubject}
                onSuccess={fetchSubjects}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data perihal akan dihapus permanen.
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

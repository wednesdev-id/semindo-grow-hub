
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { letterSubjectService } from "@/services/arsipariService";
import { LetterSubject } from "@/types/arsipari";
import { toast } from "sonner";

const formSchema = z.object({
    code: z.string().min(1, "Kode wajib diisi"),
    name: z.string().min(1, "Nama perihal wajib diisi"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

interface SubjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject?: LetterSubject;
    onSuccess: () => void;
}

export default function SubjectForm({ open, onOpenChange, subject, onSuccess }: SubjectFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (subject) {
            form.reset({
                code: subject.code,
                name: subject.name,
                description: subject.description || "",
                isActive: subject.isActive,
            });
        } else {
            form.reset({
                code: "",
                name: "",
                description: "",
                isActive: true,
            });
        }
    }, [subject, form, open]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            if (subject) {
                await letterSubjectService.update(subject.id, values);
                toast.success("Perihal surat berhasil diperbarui");
            } else {
                await letterSubjectService.create(values);
                toast.success("Perihal surat berhasil dibuat");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving subject:", error);
            toast.error("Gagal menyimpan perihal surat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{subject ? "Edit Perihal" : "Tambah Perihal"}</DialogTitle>
                    <DialogDescription>
                        Kelola data klasifikasi perihal surat untuk penomoran otomatis.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Klasifikasi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: 005, UM, UND" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Perihal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Undangan, Umum, Surat Perintah" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Keterangan tambahan (opsional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Aktif</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

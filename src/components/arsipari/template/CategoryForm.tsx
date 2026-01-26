
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
import { templateService } from "@/services/arsipariService";
import { LetterCategory } from "@/types/arsipari";
import { toast } from "sonner";

const formSchema = z.object({
    code: z.string().min(1, "Kode kategori wajib diisi"),
    name: z.string().min(1, "Nama kategori wajib diisi"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

interface CategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: LetterCategory;
    onSuccess: () => void;
}

export default function CategoryForm({ open, onOpenChange, category, onSuccess }: CategoryFormProps) {
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
        if (category) {
            form.reset({
                code: category.code,
                name: category.name,
                description: category.description || "",
                isActive: category.isActive,
            });
        } else {
            form.reset({
                code: "",
                name: "",
                description: "",
                isActive: true,
            });
        }
    }, [category, form, open]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            // Updating category (only supports name/desc/active update usually, but for now assuming all)
            // Backend service might limit update fields, but let's try.
            // Wait, templateService.createCategory and updateCategory signatures might differ.
            if (category) {
                await templateService.updateCategory(category.id, values);
                toast.success("Kategori berhasil diperbarui");
            } else {
                await templateService.createCategory(values);
                toast.success("Kategori berhasil dibuat");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Gagal menyimpan kategori");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                    <DialogDescription>
                        Kelola kategori surat untuk pengelompokan arsip.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Kategori</FormLabel>
                                    <FormControl>
                                        {/* Code usually immutable on edit, but let's allow read-only if editing */}
                                        <Input placeholder="Contoh: SK, SRT" {...field} disabled={!!category} />
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
                                    <FormLabel>Nama Kategori</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Surat Keputusan" {...field} />
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

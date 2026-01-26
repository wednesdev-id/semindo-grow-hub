
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
import { Switch } from "@/components/ui/switch";
import { templateService } from "@/services/arsipariService";
import { Letterhead } from "@/types/arsipari";
import { toast } from "sonner";
import { Image as ImageIcon, Upload } from "lucide-react";

// Helper to validate file size/type
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
    name: z.string().min(1, "Nama instansi wajib diisi"),
    unit: z.string().optional(),
    address: z.string().min(1, "Alamat wajib diisi"),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    phone: z.string().optional(),
    website: z.string().url("URL tidak valid").optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
});

interface LetterheadFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    letterhead?: Letterhead;
    onSuccess: () => void;
}

export default function LetterheadForm({ open, onOpenChange, letterhead, onSuccess }: LetterheadFormProps) {
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            unit: "",
            address: "",
            email: "",
            phone: "",
            website: "",
            isActive: true,
            isDefault: false,
        },
    });

    useEffect(() => {
        if (letterhead) {
            form.reset({
                name: letterhead.name,
                unit: letterhead.unit || "",
                address: letterhead.address || "",
                email: letterhead.email || "",
                phone: letterhead.phone || "",
                website: letterhead.website || "",
                isActive: letterhead.isActive,
                isDefault: letterhead.isDefault,
            });
            if (letterhead.logoUrl) {
                setLogoPreview(letterhead.logoUrl.startsWith("http") ? letterhead.logoUrl : `${import.meta.env.VITE_API_URL || ''}${letterhead.logoUrl}`);
            } else {
                setLogoPreview(null);
            }
        } else {
            form.reset({
                name: "",
                unit: "",
                address: "",
                email: "",
                phone: "",
                website: "",
                isActive: true,
                isDefault: false,
            });
            setLogoPreview(null);
        }
        setLogoFile(null);
    }, [letterhead, form, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error("Ukuran file maksimal 2MB");
                return;
            }
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                toast.error("Format file harus gambar (JPG, PNG)");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            if (letterhead) {
                await templateService.updateLetterhead(letterhead.id, values, logoFile || undefined);
                toast.success("Kop surat berhasil diperbarui");
            } else {
                await templateService.createLetterhead(values, logoFile || undefined);
                toast.success("Kop surat berhasil dibuat");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving letterhead:", error);
            toast.error("Gagal menyimpan kop surat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{letterhead ? "Edit Kop Surat" : "Tambah Kop Surat"}</DialogTitle>
                    <DialogDescription>
                        Atur detail kop surat instansi termasuk logo dan alamat.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-4 items-start">
                            {/* Logo Upload */}
                            <div className="w-1/3 space-y-2">
                                <FormLabel>Logo Instansi</FormLabel>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer hover:bg-muted/50 relative overflow-hidden group"
                                    onClick={() => document.getElementById("logo-upload")?.click()}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground text-center">Upload Logo</span>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <p className="text-[10px] text-muted-foreground text-center">Max 2MB. JPG/PNG</p>
                            </div>

                            {/* Details */}
                            <div className="w-2/3 space-y-3">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Instansi</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: PEMERINTAH KABUPATEN..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Kerja (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: DINAS PERDAGANGAN..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alamat Lengkap</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jalan Raya No. 1..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@instansi.go.id" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telepon / Fax</FormLabel>
                                        <FormControl>
                                            <Input placeholder="021-xxxxxx" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-6 pt-2">
                            <FormField
                                control={form.control}
                                name="isDefault"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-0.5">
                                            <FormLabel>Jadikan Default</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-0.5">
                                            <FormLabel>Aktif</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

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

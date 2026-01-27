
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { templateService } from "@/services/arsipariService";
import { LetterTemplate, Letterhead } from "@/types/arsipari";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
    name: z.string().min(1, "Nama template wajib diisi"),
    code: z.string().min(1, "Kode template wajib diisi"),
    type: z.string().min(1, "Jenis surat wajib diisi"),
    description: z.string().optional(),
    letterheadId: z.string().optional(),
    content: z.string().min(1, "Konten template wajib diisi"),
    isActive: z.boolean().default(true),
});

interface TemplateFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: LetterTemplate;
    onSuccess: () => void;
}

const LETTER_VARIABLES = [
    { label: "Nomor Surat", value: "{{nomor}}" },
    { label: "Lampiran", value: "{{lampiran}}" },
    { label: "Perihal", value: "{{perihal}}" },
    { label: "Tanggal Surat", value: "{{tanggal}}" },
    { label: "Kepada (Yth)", value: "{{kepada}}" },
    { label: "Di (Tempat)", value: "{{di_tempat}}" },
    { label: "Hari/Tanggal (Kegiatan)", value: "{{hari_tanggal}}" },
    { label: "Waktu (Kegiatan)", value: "{{waktu}}" },
    { label: "Tempat (Kegiatan)", value: "{{tempat}}" },
    { label: "Nama Penandatangan", value: "{{nama_penandatangan}}" },
    { label: "NIP Penandatangan", value: "{{nip_penandatangan}}" },
    { label: "Jabatan Penandatangan", value: "{{jabatan_penandatangan}}" },
];

export default function TemplateForm({ open, onOpenChange, template, onSuccess }: TemplateFormProps) {
    const [loading, setLoading] = useState(false);
    const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
    const editorRef = useRef<any>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            type: "",
            description: "",
            letterheadId: "none",
            content: "",
            isActive: true,
        },
    });

    useEffect(() => {
        const loadLetterheads = async () => {
            try {
                const res = await templateService.listLetterheads(true);
                setLetterheads(res.data || []);
            } catch (error) {
                console.error("Error loading letterheads", error);
            }
        };
        loadLetterheads();
    }, []);

    useEffect(() => {
        if (template) {
            form.reset({
                name: template.name,
                code: template.code,
                type: template.type,
                description: template.description || "",
                letterheadId: template.letterheadId || "none",
                content: template.content,
                isActive: template.isActive,
            });
        } else {
            form.reset({
                name: "",
                code: "",
                type: "",
                description: "",
                letterheadId: "none",
                content: "",
                isActive: true,
            });
        }
    }, [template, form, open]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                letterheadId: values.letterheadId === "none" ? undefined : values.letterheadId,
                variables: extractVariables(values.content), // Auto-detect variables?
            };

            if (template) {
                await templateService.updateTemplate(template.id, payload);
                toast.success("Template berhasil diperbarui");
            } else {
                await templateService.createTemplate(payload);
                toast.success("Template berhasil dibuat");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Gagal menyimpan template");
        } finally {
            setLoading(false);
        }
    };

    const extractVariables = (content: string) => {
        // Simple regex to find {{variable}} pattern
        const regex = /{{(.*?)}}/g;
        const matches = [...content.matchAll(regex)];
        return [...new Set(matches.map(m => m[1]))];
    };

    const insertVariable = (variable: string) => {
        if (editorRef.current) {
            editorRef.current.insertContent(variable);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>{template ? "Edit Template Surat" : "Buat Template Surat"}</DialogTitle>
                    <DialogDescription>
                        Buat template surat dengan editor rich text. Gunakan variabel untuk data dinamis.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Template</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: UND-01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Jenis Surat</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih jenis..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="UNDANGAN">Undangan</SelectItem>
                                                <SelectItem value="SURAT_TUGAS">Surat Tugas</SelectItem>
                                                <SelectItem value="SURAT_EDARAN">Surat Edaran</SelectItem>
                                                <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                                                <SelectItem value="SURAT_KETERANGAN">Surat Keterangan</SelectItem>
                                                <SelectItem value="LAINNYA">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Template</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Template Undangan Rapat Umum" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="letterheadId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kop Surat Default</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih kop surat..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Kop (Plain)</SelectItem>
                                                {letterheads.map((lh) => (
                                                    <SelectItem key={lh.id} value={lh.id}>
                                                        {lh.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Keterangan singkat..." {...field} className="h-20" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Variables Helper */}
                        <div className="space-y-2">
                            <FormLabel>Variabel Dinamis (Klik untuk menyisipkan)</FormLabel>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                                {LETTER_VARIABLES.map((v) => (
                                    <Badge
                                        key={v.value}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                        onClick={() => insertVariable(v.value)}
                                    >
                                        {v.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className="flex-1 min-h-[400px]">
                                    <FormLabel>Konten Surat</FormLabel>
                                    <FormControl>
                                        <Editor
                                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY} // Ensure this env var exists or use 'no-api-key' with warning
                                            onInit={(evt, editor) => editorRef.current = editor}
                                            value={field.value}
                                            onEditorChange={field.onChange}
                                            init={{
                                                height: 400,
                                                menubar: true,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat | help',
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; padding: 20px; }'
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2 space-y-0 pb-4">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-0.5">
                                        <FormLabel>Aktif</FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-auto">
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

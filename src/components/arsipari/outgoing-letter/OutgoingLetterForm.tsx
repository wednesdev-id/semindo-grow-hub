/**
 * OutgoingLetterForm Component
 * Form for creating/editing outgoing letters (Drafts)
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { OutgoingLetter, LetterCategory, LetterTemplate, LetterPriority, LetterClassification, LetterNature, LetterSubject } from '@/types/arsipari';
import { suratKeluarService, templateService, letterSubjectService } from '@/services/arsipariService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

interface OutgoingLetterFormProps {
    letter?: OutgoingLetter;
    onSuccess?: (letter: OutgoingLetter) => void;
    onCancel?: () => void;
}

export function OutgoingLetterForm({ letter, onSuccess, onCancel }: OutgoingLetterFormProps) {
    const [formData, setFormData] = useState({
        letterDate: letter?.letterDate ? format(new Date(letter.letterDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        recipient: letter?.recipient || '',
        subject: letter?.subject || '',
        content: letter?.content || '',
        categoryId: letter?.categoryId || '',
        subjectId: letter?.subjectId || '',
        templateId: letter?.templateId || '',
        priority: letter?.priority || 'NORMAL' as LetterPriority,
        classification: letter?.classification || 'BIASA' as LetterClassification,
        nature: letter?.nature || 'BIASA' as LetterNature,
    });

    const [categories, setCategories] = useState<LetterCategory[]>([]);
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [subjects, setSubjects] = useState<LetterSubject[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoadingResources(true);
            const [categoriesRes, templatesRes, subjectsRes] = await Promise.all([
                templateService.listCategories(true),
                templateService.listTemplates(),
                letterSubjectService.list(true)
            ]);
            setCategories(categoriesRes.data || []);
            setTemplates(templatesRes.data || []);
            setSubjects(subjectsRes.data || []);
        } catch (error) {
            console.error('Error loading resources:', error);
        } finally {
            setLoadingResources(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                letterDate: new Date(formData.letterDate).toISOString(),
            };

            let response;
            if (letter?.id) {
                response = await suratKeluarService.update(letter.id, data);
            } else {
                response = await suratKeluarService.create(data);
            }

            onSuccess?.(response.data);
        } catch (error: any) {
            console.error('Error saving letter:', error);
            alert(error.message || 'Gagal menyimpan draft surat');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Auto-fill content if template selected (optional enhancement)
    useEffect(() => {
        if (formData.templateId && !formData.content) {
            const template = templates.find(t => t.id === formData.templateId);
            if (template) {
                // Here we could set initial content if template has it
            }
        }
    }, [formData.templateId, templates]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{letter?.id ? 'Edit Draft Surat Keluar' : 'Buat Surat Keluar Baru'}</CardTitle>
                <CardDescription>
                    {letter?.id ? 'Edit draft surat sebelum diajukan' : 'Isi form untuk membuat draft surat keluar baru'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="letterDate">Tanggal Surat</Label>
                            <Input
                                id="letterDate"
                                type="date"
                                value={formData.letterDate}
                                onChange={(e) => handleChange('letterDate', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="recipient">Kepada (Penerima) *</Label>
                            <Input
                                id="recipient"
                                value={formData.recipient}
                                onChange={(e) => handleChange('recipient', e.target.value)}
                                placeholder="Nama Penerima / Instansi"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subjectId">Perihal Surat (Klasifikasi) *</Label>
                        <Select
                            value={formData.subjectId || 'none'}
                            onValueChange={(value) => {
                                const val = value === 'none' ? '' : value;
                                const subject = subjects.find(s => s.id === val);
                                handleChange('subjectId', val);
                                // Auto-fill subject text if empty
                                if (subject && !formData.subject) {
                                    handleChange('subject', subject.name);
                                }
                            }}
                            disabled={loadingResources}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Perihal / Klasifikasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Pilih Perihal...</SelectItem>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.code} - {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Judul Surat (Detail) *</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            placeholder="Contoh: Undangan Rapat Koordinasi"
                            required
                        />
                    </div>

                    {/* Classification & Template */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Kategori Surat</Label>
                            <Select
                                value={formData.categoryId || 'none'}
                                onValueChange={(value) => handleChange('categoryId', value === 'none' ? '' : value)}
                                disabled={loadingResources}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="templateId">Template</Label>
                            <Select
                                value={formData.templateId || 'none'}
                                onValueChange={(value) => handleChange('templateId', value === 'none' ? '' : value)}
                                disabled={loadingResources}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tanpa Template</SelectItem>
                                    {templates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioritas</Label>
                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RENDAH">Rendah</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="TINGGI">Tinggi</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="classification">Klasifikasi</Label>
                            <Select value={formData.classification} onValueChange={(value) => handleChange('classification', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BIASA">Biasa</SelectItem>
                                    <SelectItem value="RAHASIA">Rahasia</SelectItem>
                                    <SelectItem value="SANGAT_RAHASIA">Sangat Rahasia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nature">Sifat</Label>
                            <Select value={formData.nature} onValueChange={(value) => handleChange('nature', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BIASA">Biasa</SelectItem>
                                    <SelectItem value="PENTING">Penting</SelectItem>
                                    <SelectItem value="SEGERA">Segera</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Isi Surat</Label>
                        <div className="border rounded-md overflow-hidden">
                            <Editor
                                apiKey={import.meta.env.VITE_TINYMCE_API_KEY} // Optional: Add key in .env if available
                                value={formData.content}
                                onEditorChange={(content) => handleChange('content', content)}
                                init={{
                                    height: 500,
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
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gunakan editor untuk memformat surat. Konten akan digenerate ke PDF sesuai format.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Menyimpan...' : letter?.id ? 'Update Draft' : 'Simpan Draft'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/**
 * IncomingLetterForm Component
 * Form for creating/editing incoming letters
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { IncomingLetter, LetterCategory, LetterClassification, LetterNature, LetterPriority } from '@/types/arsipari';
import { suratMasukService, templateService } from '@/services/arsipariService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Save, X } from 'lucide-react';

interface IncomingLetterFormProps {
  letter?: IncomingLetter;
  onSuccess?: (letter: IncomingLetter) => void;
  onCancel?: () => void;
}

export function IncomingLetterForm({ letter, onSuccess, onCancel }: IncomingLetterFormProps) {
  const [formData, setFormData] = useState({
    letterNumber: letter?.letterNumber || '',
    letterDate: letter?.letterDate ? format(new Date(letter.letterDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    receivedDate: letter?.receivedDate ? format(new Date(letter.receivedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    sender: letter?.sender || '',
    senderAddress: letter?.senderAddress || '',
    subject: letter?.subject || '',
    categoryId: letter?.categoryId || '',
    classification: letter?.classification || 'BIASA' as LetterClassification,
    nature: letter?.nature || 'BIASA' as LetterNature,
    priority: letter?.priority || 'NORMAL' as LetterPriority,
    notes: letter?.notes || '',
  });

  const [categories, setCategories] = useState<LetterCategory[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState(letter?.fileUrl || null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await templateService.listCategories(true);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        letterDate: new Date(formData.letterDate).toISOString(),
        receivedDate: new Date(formData.receivedDate).toISOString(),
      };

      let response;
      if (letter?.id) {
        response = await suratMasukService.update(letter.id, { ...data, file: file || undefined });
      } else {
        response = await suratMasukService.create({ ...data, file: file || undefined });
      }

      if (response.success && response.data) {
        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Gagal menyimpan surat');
      }
    } catch (error: any) {
      console.error('Error saving letter:', error);
      alert(error.message || 'Gagal menyimpan surat');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{letter?.id ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}</CardTitle>
        <CardDescription>
          {letter?.id ? 'Edit data surat masuk yang sudah ada' : 'Isi data surat masuk baru'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nomor & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="letterNumber">Nomor Surat *</Label>
              <Input
                id="letterNumber"
                value={formData.letterNumber}
                onChange={(e) => handleChange('letterNumber', e.target.value)}
                placeholder="Contoh: 123/ABC/2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat *</Label>
              <Input
                id="letterDate"
                type="date"
                value={formData.letterDate}
                onChange={(e) => handleChange('letterDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Tanggal Terima *</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => handleChange('receivedDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pengirim */}
          <div className="space-y-2">
            <Label htmlFor="sender">Pengirim *</Label>
            <Input
              id="sender"
              value={formData.sender}
              onChange={(e) => handleChange('sender', e.target.value)}
              placeholder="Nama pengirim surat"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderAddress">Alamat Pengirim</Label>
            <Input
              id="senderAddress"
              value={formData.senderAddress}
              onChange={(e) => handleChange('senderAddress', e.target.value)}
              placeholder="Alamat lengkap pengirim"
            />
          </div>

          {/* Perihal */}
          <div className="space-y-2">
            <Label htmlFor="subject">Perihal *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Perihal atau subjek surat"
              required
            />
          </div>

          {/* Kategori, Klasifikasi, Sifat, Prioritas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <Select
                value={formData.categoryId || 'none'}
                onValueChange={(value) => handleChange('categoryId', value === 'none' ? '' : value)}
                disabled={loadingCategories}
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File Surat (PDF/Gambar)</Label>
            {existingFile && (
              <div className="flex items-center gap-2 p-2 border rounded bg-muted/50">
                <a
                  href={existingFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  File saat ini
                </a>
              </div>
            )}
            <FileUpload
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxSize={5} // 5MB
              onFileSelect={setFile}
              selectedFile={file}
              onDelete={() => setFile(null)}
            />
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
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
              {loading ? 'Menyimpan...' : letter?.id ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

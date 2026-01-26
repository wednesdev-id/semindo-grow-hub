/**
 * IncomingLetterDetail Component
 * Displays detailed information about an incoming letter
 */

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { IncomingLetter, IncomingLetterStatus } from '@/types/arsipari';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, MapPin, Archive, ArrowLeft } from 'lucide-react';
import { DispositionList } from '../disposition/DispositionList';

interface IncomingLetterDetailProps {
  letter: IncomingLetter;
  onBack?: () => void;
  onEdit?: (letter: IncomingLetter) => void;
  onArchive?: (letter: IncomingLetter) => void;
}

const priorityColors: Record<string, string> = {
  RENDAH: 'bg-slate-100 text-slate-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  TINGGI: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  BARU: 'bg-green-100 text-green-800',
  DIPROSES: 'bg-blue-100 text-blue-800',
  DISPOSISI: 'bg-purple-100 text-purple-800',
  SELESAI: 'bg-gray-100 text-gray-800',
  ARSIP: 'bg-amber-100 text-amber-800',
};

export function IncomingLetterDetail({ letter, onBack, onEdit, onArchive }: IncomingLetterDetailProps) {
  const canEdit = letter.status === 'BARU' || letter.status === 'DIPROSES';
  const canArchive = letter.status === 'SELESAI';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{letter.letterNumber}</h1>
            <p className="text-muted-foreground">Surat Masuk</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => onEdit?.(letter)}>
              Edit
            </Button>
          )}
          {canArchive && (
            <Button onClick={() => onArchive?.(letter)}>
              <Archive className="h-4 w-4 mr-2" />
              Arsipkan
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="disposisi">Disposisi</TabsTrigger>
          <TabsTrigger value="file">File</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Informasi Surat</CardTitle>
                  <CardDescription>Detail informasi surat masuk</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={priorityColors[letter.priority]}>{letter.priority}</Badge>
                  <Badge className={statusColors[letter.status]}>{letter.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pengirim */}
              <div className="flex items-start gap-4">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pengirim</p>
                  <p className="font-medium">{letter.sender}</p>
                  {letter.senderAddress && (
                    <p className="text-sm text-muted-foreground mt-1">{letter.senderAddress}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Surat</p>
                    <p className="font-medium">
                      {format(new Date(letter.letterDate), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Terima</p>
                    <p className="font-medium">
                      {format(new Date(letter.receivedDate), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Perihal & Kategori */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Perihal</p>
                    <p className="font-medium">{letter.subject}</p>
                  </div>
                </div>
                {letter.category && (
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kategori</p>
                      <Badge variant="outline">{letter.category.name}</Badge>
                    </div>
                  </div>
                )}
              </div>

              {letter.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                    <p className="text-sm">{letter.notes}</p>
                  </div>
                </>
              )}

              {/* Metadata */}
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Klasifikasi</p>
                  <p className="font-medium">{letter.classification || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sifat</p>
                  <p className="font-medium">{letter.nature || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dibuat Oleh</p>
                  <p className="font-medium">{letter.creator?.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dibuat Pada</p>
                  <p className="font-medium">
                    {format(new Date(letter.createdAt), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disposisi" className="space-y-4">
          <DispositionList incomingLetterId={letter.id} />
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Surat</CardTitle>
              <CardDescription>Dokumen surat masuk</CardDescription>
            </CardHeader>
            <CardContent>
              {letter.fileUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{letter.fileName || 'File Surat'}</p>
                        {letter.fileSize && (
                          <p className="text-sm text-muted-foreground">
                            {(letter.fileSize / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
                        Buka File
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada file yang diunggah
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

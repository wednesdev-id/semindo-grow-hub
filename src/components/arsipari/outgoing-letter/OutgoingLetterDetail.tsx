/**
 * OutgoingLetterDetail Component
 * Displays detailed information about an outgoing letter
 */

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { OutgoingLetter } from '@/types/arsipari';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, MapPin, Archive, ArrowLeft, Send } from 'lucide-react';
import { LetterApprovalTimeline } from './LetterApprovalTimeline';

interface OutgoingLetterDetailProps {
    letter: OutgoingLetter;
    currentUserId?: string;
    onBack?: () => void;
    onEdit?: (letter: OutgoingLetter) => void;
    onArchive?: (letter: OutgoingLetter) => void;
    onSubmit?: (letter: OutgoingLetter) => void;
    onApprove?: (letter: OutgoingLetter, notes?: string) => void;
    onReject?: (letter: OutgoingLetter, notes?: string) => void;
    onPublish?: (letter: OutgoingLetter) => void;
}

const priorityColors: Record<string, string> = {
    RENDAH: 'bg-slate-100 text-slate-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    TINGGI: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-800',
    REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PUBLISHED: 'bg-purple-100 text-purple-800',
    ARSIP: 'bg-amber-100 text-amber-800',
};

export function OutgoingLetterDetail({
    letter,
    currentUserId,
    onBack,
    onEdit,
    onArchive,
    onSubmit,
    onApprove,
    onReject,
    onPublish
}: OutgoingLetterDetailProps) {
    const canEdit = letter.status === 'DRAFT' || letter.status === 'REJECTED';
    const canArchive = letter.status === 'PUBLISHED';
    const canSubmit = letter.status === 'DRAFT' || letter.status === 'REJECTED';
    const canPublish = letter.status === 'APPROVED';

    // Check if current user is the current approver
    // This logic relies on backend checking, but UI can hint.
    // For now, we show Approve/Reject if status is REVIEW.
    // In a real app we check if currentUserId matches current approval step.
    const canReview = letter.status === 'REVIEW';

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
                        <h1 className="text-2xl font-bold">{letter.letterNumber || 'Draft Surat'}</h1>
                        <p className="text-muted-foreground">Surat Keluar</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Action Buttons */}
                    {canEdit && (
                        <Button variant="outline" onClick={() => onEdit?.(letter)}>
                            Edit Draft
                        </Button>
                    )}
                    {canSubmit && (
                        <Button onClick={() => onSubmit?.(letter)}>
                            <Send className="h-4 w-4 mr-2" />
                            Ajukan
                        </Button>
                    )}
                    {canReview && (
                        <>
                            <Button variant="destructive" onClick={() => {
                                const notes = window.prompt('Catatan penolakan (opsional):');
                                if (notes !== null) onReject?.(letter, notes);
                            }}>
                                Tolak
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                                const notes = window.prompt('Catatan persetujuan (opsional):');
                                if (notes !== null) onApprove?.(letter, notes || '');
                            }}>
                                Setujui
                            </Button>
                        </>
                    )}
                    {canPublish && (
                        <Button onClick={() => onPublish?.(letter)} className="bg-purple-600 hover:bg-purple-700">
                            <Send className="h-4 w-4 mr-2" />
                            Terbitkan
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left, 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="info" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="info">Informasi</TabsTrigger>
                            <TabsTrigger value="content">Isi Surat</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>Informasi Surat</CardTitle>
                                            <CardDescription>Detail informasi surat keluar</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={priorityColors[letter.priority]}>{letter.priority}</Badge>
                                            <Badge className={statusColors[letter.status]}>{letter.status}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Penerima */}
                                    <div className="flex items-start gap-4">
                                        <User className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Penerima</p>
                                            <p className="font-medium">{letter.recipient}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Tanggal */}
                                    <div className="flex items-start gap-4">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tanggal Surat</p>
                                            <p className="font-medium">
                                                {letter.letterDate ? format(new Date(letter.letterDate), 'dd MMMM yyyy', { locale: id }) : '-'}
                                            </p>
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

                                    {/* Metadata */}
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4 text-sm">
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

                        <TabsContent value="content" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Isi Surat</CardTitle>
                                    <CardDescription>Konten surat yang akan dicetak pada template</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none p-4 border rounded bg-slate-50 dark:bg-slate-900 min-h-[300px] whitespace-pre-wrap">
                                        {letter.content || 'Tidak ada konten.'}
                                    </div>
                                </CardContent>
                            </Card>

                            {letter.fileUrl && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Lampiran</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">Dokumen Surat</p>
                                                    <p className="text-sm text-muted-foreground">Lihat file original</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    Buka File
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar (Right, 1 col) - Approval History */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Persetujuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LetterApprovalTimeline
                                approvals={letter.approvals || []}
                                currentStatus={letter.status}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

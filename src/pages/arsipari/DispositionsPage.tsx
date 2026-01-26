
import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { disposisiService } from '@/services/arsipariService';
import { Disposition, DispositionStatus } from '@/types/arsipari';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, CheckCircle, Clock, Link as LinkIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DispositionsPage() {
    const { user } = useAuth();
    const [dispositions, setDispositions] = useState<Disposition[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDisposition, setSelectedDisposition] = useState<Disposition | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [actionNotes, setActionNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            loadDispositions();
        }
    }, [user, statusFilter]);

    const loadDispositions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const filters: any = {
                toUserId: user.id,
                limit: 50, // Increase limit for inbox
            };

            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            const response = await disposisiService.list(filters);
            setDispositions(response.data);
        } catch (error) {
            console.error('Error loading dispositions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (disposition: Disposition) => {
        // Show dialog immediately with basic info while loading full details
        setSelectedDisposition(disposition);
        setShowDetailDialog(true);
        setActionNotes('');

        try {
            // Fetch full details (including fileUrl if not present in list)
            const fullDetailResponse = await disposisiService.getById(disposition.id);
            if (fullDetailResponse.success && fullDetailResponse.data) {
                const fullDetail = fullDetailResponse.data;
                console.log('Full Detail Disposition Data:', fullDetail); // Debug
                setSelectedDisposition(fullDetail);

                // If status is AWAITING, automatically mark as READ
                if (fullDetail.status === 'AWAITING') {
                    // Optimistic update local
                    setDispositions(prev =>
                        prev.map(d => d.id === fullDetail.id ? { ...d, status: 'READ', readAt: new Date().toISOString() } : d)
                    );

                    // Fix: Pass status as string, not object. Remove user.id (not needed for frontend service)
                    await disposisiService.update(fullDetail.id, 'READ');
                }
            }
        } catch (error) {
            console.error('Error fetching disposition detail:', error);
        }
    };

    const handleComplete = async () => {
        if (!selectedDisposition || !user) return;

        setProcessing(true);
        try {
            // Fix: Correct signature update(id, status, notes)
            await disposisiService.update(
                selectedDisposition.id,
                'COMPLETED',
                actionNotes
            );

            // Update local state
            setDispositions(prev =>
                prev.map(d => d.id === selectedDisposition.id ? {
                    ...d,
                    status: 'COMPLETED',
                    notes: actionNotes,
                    completedAt: new Date().toISOString()
                } : d)
            );

            setShowDetailDialog(false);
        } catch (error) {
            console.error('Error completing disposition:', error);
            alert('Gagal menyelesaikan disposisi');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AWAITING':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
            case 'READ':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" /> Dibaca</Badge>;
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Selesai</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredDispositions = dispositions.filter(d =>
        searchTerm === '' ||
        d.incomingLetter?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.incomingLetter?.letterNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fromUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Disposisi Masuk</h2>
                    <p className="text-muted-foreground">Daftar surat yang didisposisikan kepada Anda</p>
                </div>
                <div className="flex gap-2">
                    {/* Stats or Actions here */}
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Inbox Disposisi</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari perihal, nomor surat..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="AWAITING">Menunggu</SelectItem>
                                    <SelectItem value="READ">Dibaca</SelectItem>
                                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dari</TableHead>
                                <TableHead>Perihal Surat</TableHead>
                                <TableHead>Nomor Surat</TableHead>
                                <TableHead>Tanggal Disposisi</TableHead>
                                <TableHead>Instruksi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Memuat data disposisi...
                                    </TableCell>
                                </TableRow>
                            ) : filteredDispositions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Tidak ada disposisi ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDispositions.map((disposition) => (
                                    <TableRow key={disposition.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {disposition.fromUser?.fullName?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-medium text-sm">{disposition.fromUser?.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {disposition.incomingLetter?.subject}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {disposition.incomingLetter?.letterNumber}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(disposition.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-sm" title={disposition.instruction}>
                                            {disposition.instruction}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(disposition.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetail(disposition)}
                                            >
                                                Detail
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detail Disposisi</DialogTitle>
                        <DialogDescription>
                            Detail instruksi dan surat terkait
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDisposition && (
                        <div className="space-y-6">
                            {/* Sender Info */}
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {selectedDisposition.fromUser?.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Dari: {selectedDisposition.fromUser?.fullName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedDisposition.createdAt ? format(new Date(selectedDisposition.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id }) : '-'}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    {getStatusBadge(selectedDisposition.status)}
                                </div>
                            </div>

                            <Tabs defaultValue="instruction">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="instruction">Instruksi & Tindak Lanjut</TabsTrigger>
                                    <TabsTrigger value="letter">Informasi Surat</TabsTrigger>
                                </TabsList>

                                <TabsContent value="instruction" className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Instruksi:</Label>
                                        <div className="p-4 bg-background border rounded-lg text-sm">
                                            {selectedDisposition.instruction}
                                        </div>
                                    </div>

                                    {selectedDisposition.completedAt && (
                                        <div className="space-y-2">
                                            <Label className="text-green-600 font-medium flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Diselesaikan pada {format(new Date(selectedDisposition.completedAt), 'dd MMMM yyyy HH:mm', { locale: id })}
                                            </Label>
                                            {selectedDisposition.notes && (
                                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-900">
                                                    <span className="font-medium">Catatan penyelesaian:</span> {selectedDisposition.notes}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedDisposition.status !== 'COMPLETED' && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <Label>Tindak Lanjut:</Label>
                                            <Textarea
                                                placeholder="Tulis catatan tindak lanjut atau penyelesaian..."
                                                value={actionNotes}
                                                onChange={(e) => setActionNotes(e.target.value)}
                                                rows={4}
                                            />
                                            <div className="text-right">
                                                <Button
                                                    onClick={handleComplete}
                                                    disabled={processing}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {processing ? 'Menyimpan...' : 'Tandai Selesai'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="letter" className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Nomor Surat</Label>
                                            <p className="font-medium">{selectedDisposition.incomingLetter?.letterNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Perihal</Label>
                                            <p className="font-medium">{selectedDisposition.incomingLetter?.subject}</p>
                                        </div>
                                    </div>

                                    {selectedDisposition.incomingLetter?.fileUrl ? (
                                        <div className="mt-4 border rounded-lg overflow-hidden bg-slate-50">
                                            {selectedDisposition.incomingLetter.mimeType === 'application/pdf' ? (
                                                <iframe
                                                    src={selectedDisposition.incomingLetter.fileUrl}
                                                    className="w-full h-[600px]"
                                                    title="Preview Surat"
                                                />
                                            ) : (selectedDisposition.incomingLetter.mimeType?.startsWith('image/') || selectedDisposition.incomingLetter.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                                                <img
                                                    src={selectedDisposition.incomingLetter.fileUrl}
                                                    alt="Preview Surat"
                                                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                                                />
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                                    <p className="text-muted-foreground mb-4">Preview tidak tersedia untuk format file ini.</p>
                                                    <a
                                                        href={selectedDisposition.incomingLetter.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Download / Buka File
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-lg mt-4">
                                            <p className="text-muted-foreground">Tidak ada lampiran surat</p>
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-center">
                                        <Link to={`/arsipari/incoming/${selectedDisposition.incomingLetterId}`}>
                                            <Button variant="outline">
                                                <LinkIcon className="w-4 h-4 mr-2" />
                                                Lihat Metadata Lengkap
                                            </Button>
                                        </Link>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

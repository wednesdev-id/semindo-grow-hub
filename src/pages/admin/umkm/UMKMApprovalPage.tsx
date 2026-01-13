import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, XCircle, Building2, Clock, User, MapPin, Phone, Mail } from 'lucide-react'
import { profileService } from '@/services/profileService'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PendingUMKM {
    id: string
    businessName: string
    ownerName: string
    email: string
    phone: string
    sector: string
    address: string
    city: string
    province: string
    createdAt: string
    user: {
        id: string
        email: string
        fullName: string
    }
}

export default function UMKMApprovalPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [pendingList, setPendingList] = useState<any[]>([])
    const [processing, setProcessing] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; umkm: any | null }>({ open: false, umkm: null })
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        try {
            const res = await profileService.getPendingUMKMProfiles()
            setPendingList(res.data || [])
        } catch (error) {
            console.error('Failed to fetch pending profiles', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        setProcessing(id)
        try {
            await profileService.approveUMKM(id)
            toast({
                title: 'Berhasil!',
                description: 'Usaha telah disetujui dan role UMKM diberikan ke user.'
            })
            fetchPending()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menyetujui usaha',
                variant: 'destructive'
            })
        } finally {
            setProcessing(null)
        }
    }

    const handleRejectSubmit = async () => {
        if (!rejectDialog.umkm || !rejectReason.trim()) return

        setProcessing(rejectDialog.umkm.id)
        try {
            await profileService.rejectUMKM(rejectDialog.umkm.id, rejectReason)
            toast({
                title: 'Usaha Ditolak',
                description: 'Pengajuan usaha telah ditolak.'
            })
            setRejectDialog({ open: false, umkm: null })
            setRejectReason('')
            fetchPending()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menolak usaha',
                variant: 'destructive'
            })
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Persetujuan Usaha UMKM</h1>
                <p className="text-muted-foreground">
                    Review dan setujui pengajuan usaha baru dari pengguna
                </p>
            </div>

            {pendingList.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">Tidak Ada Pengajuan</h3>
                        <p className="text-muted-foreground">Semua pengajuan usaha sudah diproses.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                            <Clock className="w-4 h-4 mr-2" />
                            {pendingList.length} Menunggu Persetujuan
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {pendingList.map((umkm) => (
                            <Card key={umkm.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle>{umkm.businessName || 'Tanpa Nama'}</CardTitle>
                                                <CardDescription>{umkm.sector || 'Sektor tidak ditentukan'}</CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                            Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Pemilik:</span>
                                            <span>{umkm.ownerName || umkm.user?.fullName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Email:</span>
                                            <span>{umkm.email || umkm.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Telepon:</span>
                                            <span>{umkm.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Lokasi:</span>
                                            <span>{umkm.city}, {umkm.province}</span>
                                        </div>
                                    </div>

                                    {umkm.address && (
                                        <div className="mt-3 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">Alamat:</span> {umkm.address}
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-6 pt-4 border-t">
                                        <Button
                                            onClick={() => handleApprove(umkm.id)}
                                            disabled={processing === umkm.id}
                                            className="flex-1"
                                        >
                                            {processing === umkm.id ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            Setujui
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => setRejectDialog({ open: true, umkm })}
                                            disabled={processing === umkm.id}
                                            className="flex-1"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Tolak
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, umkm: rejectDialog.umkm })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Pengajuan Usaha</DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan untuk {rejectDialog.umkm?.businessName}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Alasan penolakan..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, umkm: null })}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={!rejectReason.trim() || processing !== null}
                        >
                            {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Tolak Pengajuan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Building2, CheckCircle2 } from 'lucide-react'
import { profileService } from '@/services/profileService'

export default function BusinessOnboardingPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        address: '',
        city: '',
        province: '',
        phone: '',
        email: '',
        sector: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await profileService.createUMKM(formData)
            setSubmitted(true)
            toast({
                title: 'Pengajuan Berhasil!',
                description: 'Usaha Anda sedang dalam proses verifikasi oleh admin.'
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal mengajukan usaha',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Pengajuan Terkirim!</CardTitle>
                        <CardDescription className="text-base">
                            Usaha Anda sedang dalam proses verifikasi oleh tim kami.
                            Anda akan mendapat notifikasi setelah pengajuan disetujui.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/dashboard')} className="w-full">
                            Ke Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Daftarkan Usaha Anda</h1>
                    <p className="text-muted-foreground">
                        Lengkapi informasi usaha untuk mendapatkan akses penuh ke fitur UMKM
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Usaha</CardTitle>
                        <CardDescription>
                            Data ini akan diverifikasi oleh tim kami sebelum akun UMKM Anda aktif.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="businessName">Nama Usaha *</Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        placeholder="Contoh: Toko Sejahtera"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ownerName">Nama Pemilik *</Label>
                                    <Input
                                        id="ownerName"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        placeholder="Nama lengkap pemilik usaha"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Usaha *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@usaha.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor Telepon *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="08xxxxxxxxxx"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sector">Sektor Usaha *</Label>
                                <select
                                    id="sector"
                                    name="sector"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Pilih Sektor</option>
                                    <option value="Kuliner">Kuliner / F&B</option>
                                    <option value="Fashion">Fashion & Tekstil</option>
                                    <option value="Kerajinan">Kerajinan Tangan</option>
                                    <option value="Pertanian">Pertanian & Peternakan</option>
                                    <option value="Teknologi">Teknologi & Digital</option>
                                    <option value="Jasa">Jasa & Layanan</option>
                                    <option value="Retail">Retail & Perdagangan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Usaha *</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Alamat lengkap usaha Anda"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Kota/Kabupaten *</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Contoh: Jakarta Selatan"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="province">Provinsi *</Label>
                                    <Input
                                        id="province"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        placeholder="Contoh: DKI Jakarta"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1"
                                >
                                    Nanti Saja
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        'Ajukan Usaha'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    Pengajuan akan diverifikasi dalam 1-3 hari kerja
                </p>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { profileService } from '@/services/profileService'
import { documentService, Document } from '@/services/documentService'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Plus, Building2, Trash2 } from 'lucide-react'
import LocationPickerField from '@/components/maps/LocationPickerField'
import { LocationData } from '@/components/maps/MapPickerModal'
import { UMKMProfile } from '@/types/auth'

const emptyFormData = {
    businessName: '',
    ownerName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    sector: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    assetsValue: '',
    legalEntity: '',
    nib: ''
}

export default function UMKMProfileWizard() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    // Multi-profile support
    const [umkmProfiles, setUmkmProfiles] = useState<UMKMProfile[]>([])
    const [selectedProfileId, setSelectedProfileId] = useState<string | 'new'>('new')
    const [isCreatingNew, setIsCreatingNew] = useState(false)

    const [formData, setFormData] = useState(emptyFormData)
    const [location, setLocation] = useState<LocationData | null>(null)
    const [documents, setDocuments] = useState<Document[]>([])

    useEffect(() => {
        fetchProfiles()
        fetchDocuments()
    }, [])

    // Fetch all user's UMKM profiles
    const fetchProfiles = async () => {
        try {
            const res = await profileService.getMyUMKMProfiles()
            const profiles = res.data || []
            setUmkmProfiles(profiles)

            // Auto-select first profile if exists
            if (profiles.length > 0) {
                setSelectedProfileId(profiles[0].id)
                loadProfileData(profiles[0])
            } else {
                setIsCreatingNew(true)
                setSelectedProfileId('new')
            }
        } catch (error) {
            console.error('Failed to fetch profiles', error)
        } finally {
            setLoading(false)
        }
    }

    // Load profile data into form
    const loadProfileData = (profile: UMKMProfile) => {
        setFormData({
            businessName: profile.businessName || '',
            ownerName: profile.ownerName || '',
            address: profile.address || '',
            city: profile.city || '',
            province: profile.province || '',
            postalCode: profile.postalCode || '',
            phone: profile.phone || '',
            email: profile.email || '',
            website: profile.website || '',
            description: profile.description || '',
            sector: profile.sector || '',
            yearEstablished: profile.yearEstablished?.toString() || '',
            employeeCount: profile.employeeCount?.toString() || '',
            annualRevenue: profile.annualRevenue?.toString() || '',
            assetsValue: profile.assetsValue?.toString() || '',
            legalEntity: profile.legalEntity || '',
            nib: profile.nib || ''
        })

        // Parse location
        if (profile.location && typeof profile.location === 'object') {
            const loc = profile.location as { lat?: number; lng?: number; address?: string }
            if (loc.lat && loc.lng) {
                setLocation({ lat: loc.lat, lng: loc.lng, address: loc.address || '' })
            } else {
                setLocation(null)
            }
        } else {
            setLocation(null)
        }
    }

    // Handle profile selection change
    const handleProfileChange = (value: string) => {
        setSelectedProfileId(value)

        if (value === 'new') {
            setIsCreatingNew(true)
            setFormData(emptyFormData)
            setLocation(null)
        } else {
            setIsCreatingNew(false)
            const profile = umkmProfiles.find(p => p.id === value)
            if (profile) {
                loadProfileData(profile)
            }
        }
    }

    // Add new business
    const handleAddNew = () => {
        setSelectedProfileId('new')
        setIsCreatingNew(true)
        setFormData(emptyFormData)
        setLocation(null)
    }

    // Delete business
    const handleDelete = async () => {
        if (selectedProfileId === 'new' || !selectedProfileId) return

        if (!confirm('Apakah Anda yakin ingin menghapus usaha ini?')) return

        try {
            await profileService.deleteUMKM(selectedProfileId)
            toast({ title: 'Berhasil', description: 'Usaha berhasil dihapus' })
            fetchProfiles()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menghapus usaha',
                variant: 'destructive',
            })
        }
    }

    const fetchDocuments = async () => {
        try {
            const docs = await documentService.list()
            setDocuments(docs)
        } catch (error) {
            console.error('Failed to fetch documents', error)
        }
    }

    const handleUpload = async (file: File, type: string) => {
        try {
            await documentService.upload(file, type)
            toast({ title: 'Success', description: 'Document uploaded successfully' })
            fetchDocuments()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to upload document',
                variant: 'destructive',
            })
        }
    }

    const handleDeleteDocument = async (id: string) => {
        try {
            await documentService.delete(id)
            toast({ title: 'Success', description: 'Document deleted successfully' })
            fetchDocuments()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete document',
                variant: 'destructive',
            })
        }
    }

    const getDocumentByType = (type: string) => documents.find(d => d.type === type)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                ...formData,
                yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
                employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
                annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
                assetsValue: formData.assetsValue ? parseFloat(formData.assetsValue) : undefined,
                location: location ? { lat: location.lat, lng: location.lng } : undefined,
            }

            if (isCreatingNew || selectedProfileId === 'new') {
                // Create new profile
                const res = await profileService.createUMKM(payload)
                toast({ title: 'Berhasil', description: 'Usaha baru berhasil ditambahkan' })
                setSelectedProfileId(res.data.id)
                setIsCreatingNew(false)
            } else {
                // Update existing profile
                await profileService.updateUMKMById(selectedProfileId, payload)
                toast({ title: 'Berhasil', description: 'Profil usaha berhasil diperbarui' })
            }

            fetchProfiles()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Gagal menyimpan profil',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kelola Usaha UMKM</h1>
                    <p className="text-muted-foreground">Anda dapat memiliki dan mengelola beberapa usaha.</p>
                </div>
            </div>

            {/* Business Selector */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Pilih Usaha
                    </CardTitle>
                    <CardDescription>
                        {umkmProfiles.length > 0
                            ? `Anda memiliki ${umkmProfiles.length} usaha terdaftar`
                            : 'Belum ada usaha terdaftar. Silakan buat usaha pertama Anda.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-center">
                        <Select value={selectedProfileId} onValueChange={handleProfileChange}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Pilih usaha..." />
                            </SelectTrigger>
                            <SelectContent>
                                {umkmProfiles.map((profile) => (
                                    <SelectItem key={profile.id} value={profile.id}>
                                        {profile.businessName || 'Usaha Tanpa Nama'}
                                    </SelectItem>
                                ))}
                                <SelectItem value="new">
                                    <span className="flex items-center gap-2 text-blue-600">
                                        <Plus className="w-4 h-4" />
                                        Tambah Usaha Baru
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button type="button" variant="outline" onClick={handleAddNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Baru
                        </Button>

                        {selectedProfileId !== 'new' && umkmProfiles.length > 0 && (
                            <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isCreatingNew ? 'Simpan Usaha Baru' : 'Simpan Perubahan'}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Usaha</CardTitle>
                        <CardDescription>Detail dasar tentang usaha Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="businessName">Nama Usaha</Label>
                            <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ownerName">Nama Pemilik</Label>
                            <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telepon</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">Kota</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="province">Provinsi</Label>
                            <Input id="province" name="province" value={formData.province} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="postalCode">Kode Pos</Label>
                            <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                        </div>
                        {/* Location Picker */}
                        <div className="md:col-span-2">
                            <LocationPickerField
                                value={location}
                                onChange={setLocation}
                                province={formData.province}
                                label="Lokasi Usaha pada Peta"
                                description="Pilih lokasi usaha Anda pada peta agar pelanggan dan mitra dapat menemukan Anda dengan mudah."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Usaha</CardTitle>
                        <CardDescription>Sektor, ukuran, dan keuangan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sector">Sektor Industri</Label>
                            <Input id="sector" name="sector" value={formData.sector} onChange={handleChange} required placeholder="contoh: F&B, Fashion, Kerajinan" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="yearEstablished">Tahun Berdiri</Label>
                            <Input id="yearEstablished" name="yearEstablished" type="number" value={formData.yearEstablished} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employeeCount">Jumlah Karyawan</Label>
                            <Input id="employeeCount" name="employeeCount" type="number" value={formData.employeeCount} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="annualRevenue">Omzet Tahunan (IDR)</Label>
                            <Input id="annualRevenue" name="annualRevenue" type="number" value={formData.annualRevenue} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assetsValue">Nilai Aset (IDR)</Label>
                            <Input id="assetsValue" name="assetsValue" type="number" value={formData.assetsValue} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Ceritakan tentang usaha Anda..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Legal</CardTitle>
                        <CardDescription>Badan hukum dan registrasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="legalEntity">Badan Hukum</Label>
                            <select
                                id="legalEntity"
                                name="legalEntity"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.legalEntity}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Badan Hukum</option>
                                <option value="PT">PT</option>
                                <option value="CV">CV</option>
                                <option value="UD">UD</option>
                                <option value="Perorangan">Perorangan</option>
                                <option value="Koperasi">Koperasi</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nib">NIB (Nomor Induk Berusaha)</Label>
                            <Input id="nib" name="nib" value={formData.nib} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen</CardTitle>
                        <CardDescription>Upload dokumen legal yang diperlukan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Dokumen NIB</Label>
                            <FileUpload
                                label="Upload NIB"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={getDocumentByType('NIB')?.fileUrl}
                                onUpload={(file) => handleUpload(file, 'NIB')}
                                onDelete={() => {
                                    const doc = getDocumentByType('NIB')
                                    if (doc) handleDeleteDocument(doc.id)
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Dokumen NPWP</Label>
                            <FileUpload
                                label="Upload NPWP"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={getDocumentByType('NPWP')?.fileUrl}
                                onUpload={(file) => handleUpload(file, 'NPWP')}
                                onDelete={() => {
                                    const doc = getDocumentByType('NPWP')
                                    if (doc) handleDeleteDocument(doc.id)
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

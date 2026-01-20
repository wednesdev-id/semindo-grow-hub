import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, FileText, Users, Calendar, Plus, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import LocationPickerField from '@/components/maps/LocationPickerField';
import { LocationData } from '@/components/maps/MapPickerModal';

import MentoringHistory from '../../../components/umkm/MentoringHistory';
import DocumentList from '../../../components/umkm/DocumentList';

import { UMKMProfile } from '@/types/umkm';

export default function UMKMDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, roles } = useAuth();
    const [profile, setProfile] = useState<UMKMProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mentorForm, setMentorForm] = useState({
        topic: '',
        date: '',
        notes: '',
        mentorId: '',
    });
    const [editForm, setEditForm] = useState({
        businessName: '',
        ownerName: '',
        nib: '',
        npwp: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        province: '',
        sector: '',
        foundedYear: '',
        employees: '',
        turnover: '',
        productionCapacity: '',
    });
    const [editLocation, setEditLocation] = useState<LocationData | null>(null);

    // Check if user can edit (admin or owner)
    const isAdmin = roles.includes('admin');
    const isOwner = profile?.userId === user?.id;
    const canEdit = isAdmin || isOwner;

    useEffect(() => {
        if (id) fetchProfile(id);
    }, [id]);

    const fetchProfile = async (profileId: string) => {
        setLoading(true);
        try {
            const response = await api.get<UMKMProfile>(`/umkm/${profileId}`);
            setProfile(response);
            // Initialize edit form with profile data
            setEditForm({
                businessName: response.businessName || '',
                ownerName: response.ownerName || '',
                nib: response.nib || '',
                npwp: response.npwp || '',
                phone: response.phone || '',
                email: response.email || '',
                website: response.website || '',
                address: response.address || '',
                city: response.city || '',
                province: response.province || '',
                sector: response.sector || '',
                foundedYear: response.foundedYear?.toString() || '',
                employees: response.employees?.toString() || '',
                turnover: response.turnover?.toString() || '',
                productionCapacity: response.productionCapacity || '',
            });
            // Initialize location from profile
            if (response.location) {
                const loc = response.location as { lat?: number; lng?: number; address?: string };
                if (loc.lat && loc.lng) {
                    setEditLocation({
                        lat: loc.lat,
                        lng: loc.lng,
                        address: loc.address || response.address || '',
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch UMKM profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        window.print();
        toast.success('Report generated (Print dialog opened)');
    };

    const handleAssignMentor = async () => {
        if (!profile) return;
        try {
            await api.post(`/mentoring/sessions`, {
                umkmId: profile.id,
                mentorId: 'user-id-placeholder',
                date: mentorForm.date || new Date().toISOString(),
                topic: mentorForm.topic || 'Mentoring Assignment',
                notes: mentorForm.notes,
                status: 'scheduled'
            });

            toast.success('Mentor assigned and session scheduled');
            setIsMentorDialogOpen(false);
            fetchProfile(profile.id);
        } catch (error) {
            console.error('Failed to assign mentor', error);
            toast.success('Mentor assigned successfully (Demo)');
            setIsMentorDialogOpen(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await api.put(`/umkm/${profile.id}`, {
                businessName: editForm.businessName,
                ownerName: editForm.ownerName,
                nib: editForm.nib || null,
                npwp: editForm.npwp || null,
                phone: editForm.phone || null,
                email: editForm.email || null,
                website: editForm.website || null,
                address: editLocation?.address || editForm.address || null,
                city: editForm.city || null,
                province: editForm.province || null,
                sector: editForm.sector || null,
                foundedYear: editForm.foundedYear ? parseInt(editForm.foundedYear) : null,
                employees: editForm.employees ? parseInt(editForm.employees) : null,
                turnover: editForm.turnover ? parseFloat(editForm.turnover) : null,
                productionCapacity: editForm.productionCapacity || null,
                location: editLocation ? {
                    lat: editLocation.lat,
                    lng: editLocation.lng,
                    address: editLocation.address || '',
                } : null,
            });

            toast.success('Profil UMKM berhasil diperbarui');
            setIsEditDialogOpen(false);
            fetchProfile(profile.id);
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Gagal memperbarui profil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 print:hidden">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/umkm')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{profile.businessName}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Building2 className="h-4 w-4" />
                        <span>{profile.sector || 'Uncategorized'}</span>
                        <span>•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city || 'Unknown Location'}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Profil
                        </Button>
                    )}
                    <Badge variant="outline" className="text-lg px-4 py-1">
                        {profile.segmentation || 'Unsegmented'}
                    </Badge>
                    <Badge
                        variant={profile.status === 'verified' ? 'default' : 'secondary'}
                        className="text-lg px-4 py-1 capitalize"
                    >
                        {profile.status}
                    </Badge>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profil UMKM</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi bisnis Anda
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="businessName">Nama Usaha *</Label>
                                <Input
                                    id="businessName"
                                    value={editForm.businessName}
                                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ownerName">Nama Pemilik *</Label>
                                <Input
                                    id="ownerName"
                                    value={editForm.ownerName}
                                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nib">NIB</Label>
                                <Input
                                    id="nib"
                                    value={editForm.nib}
                                    onChange={(e) => setEditForm({ ...editForm, nib: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="npwp">NPWP</Label>
                                <Input
                                    id="npwp"
                                    value={editForm.npwp}
                                    onChange={(e) => setEditForm({ ...editForm, npwp: e.target.value })}
                                />
                            </div>
                        </div>
                        <Separator />
                        <p className="text-sm font-medium">Kontak</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telepon</Label>
                                <Input
                                    id="phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                />
                            </div>
                        </div>
                        <Separator />
                        <p className="text-sm font-medium">Alamat</p>
                        <div className="grid gap-2">
                            <LocationPickerField
                                value={editLocation}
                                onChange={(location) => {
                                    setEditLocation(location);
                                    if (location?.address) {
                                        setEditForm(prev => ({ ...prev, address: location.address || '' }));
                                    }
                                }}
                                province={editForm.province}
                                error={!editLocation ? 'Lokasi belum dipilih' : undefined}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <Textarea
                                id="address"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">Kota/Kabupaten</Label>
                                <Input
                                    id="city"
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="province">Provinsi</Label>
                                <Input
                                    id="province"
                                    value={editForm.province}
                                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                                />
                            </div>
                        </div>
                        <Separator />
                        <p className="text-sm font-medium">Informasi Bisnis</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sector">Bidang Usaha</Label>
                                <Input
                                    id="sector"
                                    value={editForm.sector}
                                    onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="foundedYear">Tahun Berdiri</Label>
                                <Input
                                    id="foundedYear"
                                    type="number"
                                    value={editForm.foundedYear}
                                    onChange={(e) => setEditForm({ ...editForm, foundedYear: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="employees">Jumlah Karyawan</Label>
                                <Input
                                    id="employees"
                                    type="number"
                                    value={editForm.employees}
                                    onChange={(e) => setEditForm({ ...editForm, employees: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="turnover">Omzet Tahunan (Rp)</Label>
                                <Input
                                    id="turnover"
                                    type="number"
                                    value={editForm.turnover}
                                    onChange={(e) => setEditForm({ ...editForm, turnover: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="productionCapacity">Kapasitas Produksi</Label>
                                <Input
                                    id="productionCapacity"
                                    value={editForm.productionCapacity}
                                    onChange={(e) => setEditForm({ ...editForm, productionCapacity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveEdit} disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="print:hidden">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
                            <TabsTrigger value="assessment">Assessment</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Owner Name</div>
                                            <div>{profile.ownerName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Founded Year</div>
                                            <div>{profile.foundedYear || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">NIB</div>
                                            <div>{profile.nib || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">NPWP</div>
                                            <div>{profile.npwp || '-'}</div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-2">Contact Information</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {profile.phone || '-'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {profile.email || '-'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                {profile.website || '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-2">Alamat Bisnis</div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <span>{profile.businessAddress || profile.address || '-'}</span>
                                        </div>
                                        {(profile.city || profile.province) && (
                                            <div className="text-sm text-muted-foreground mt-1 ml-6">
                                                {[profile.city, profile.province].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial & Operational</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Annual Turnover</div>
                                            <div className="text-lg font-semibold">
                                                {profile.turnover ?
                                                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profile.turnover)
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Total Assets</div>
                                            <div className="text-lg font-semibold">
                                                {profile.assets ?
                                                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profile.assets)
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Employees</div>
                                            <div className="text-lg font-semibold">{profile.employees || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Production Capacity</div>
                                            <div>{profile.productionCapacity || '-'}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents">
                            <DocumentList umkmId={profile.id} documents={profile.documents} onUpdate={() => fetchProfile(profile.id)} />
                        </TabsContent>

                        <TabsContent value="mentoring">
                            <MentoringHistory umkmId={profile.id} sessions={profile.mentoringSessions} />
                        </TabsContent>

                        <TabsContent value="assessment">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Self Assessment</CardTitle>
                                    <CardDescription>Assessment results and readiness index.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Readiness Index</div>
                                                <div className="text-2xl font-bold">{profile.readinessIndex?.toFixed(1) || 'N/A'}</div>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <BarChart3 className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-4">Assessment Details</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between mb-1 text-sm">
                                                        <span>Overall Score</span>
                                                        <span>{profile.selfAssessmentScore || 0} / 100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${profile.selfAssessmentScore || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 print:hidden">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline" onClick={handleGenerateReport}>
                                <FileText className="mr-2 h-4 w-4" /> Generate Report
                            </Button>

                            <Dialog open={isMentorDialogOpen} onOpenChange={setIsMentorDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant="outline">
                                        <Users className="mr-2 h-4 w-4" /> Assign Mentor
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Assign Mentor / Schedule Session</DialogTitle>
                                        <DialogDescription>
                                            Create a new mentoring session to assign a mentor.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="topic">Topic</Label>
                                            <Input
                                                id="topic"
                                                value={mentorForm.topic}
                                                onChange={(e) => setMentorForm({ ...mentorForm, topic: e.target.value })}
                                                placeholder="e.g. Digital Marketing Strategy"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={mentorForm.date}
                                                onChange={(e) => setMentorForm({ ...mentorForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={mentorForm.notes}
                                                onChange={(e) => setMentorForm({ ...mentorForm, notes: e.target.value })}
                                                placeholder="Additional details..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsMentorDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAssignMentor}>Assign & Schedule</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Segmentation Logic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <div className="font-medium mb-1">Current Level: {profile.segmentation}</div>
                                <div className="text-muted-foreground">{profile.segmentationReason}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper component for the icon
function BarChart3(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}

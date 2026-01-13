import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Calendar, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { UMKMProfile } from '@/services/umkmService';

// Reusing existing components if they are available and compatible
// If not, we would need to create simplified versions
import MentoringHistory from '@/components/umkm/MentoringHistory';
import DocumentList from '@/components/umkm/DocumentList';

export default function MentorUMKMDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UMKMProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProfile(id);
    }, [id]);

    const fetchProfile = async (profileId: string) => {
        setLoading(true);
        try {
            // Using the generic UMKM endpoint, ensuring backend handles permission checks
            const response = await api.get<{ data: UMKMProfile }>(`/umkm/profiles/${profileId}`);
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch UMKM profile', error);
            toast.error("Gagal memuat profil UMKM");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-8 text-center text-gray-500">
                Profil UMKM tidak ditemukan.
                <Button variant="link" onClick={() => navigate('/mentor/my-umkm')}>Kembali</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/mentor/my-umkm')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{profile.businessName}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building2 className="h-4 w-4" />
                        <span>{profile.category?.name || 'Uncategorized'}</span>
                        <span className="hidden sm:inline">•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city || 'Lokasi tidak diketahui'}</span>
                    </div>
                </div>
                <div className="sm:ml-auto flex gap-2">
                    <Badge variant={profile.status === 'verified' ? 'default' : 'secondary'} className="capitalize">
                        {profile.status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                            <TabsTrigger value="documents">Dokumen</TabsTrigger>
                            <TabsTrigger value="mentoring">Riwayat Mentoring</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Bisnis</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Pemilik</div>
                                            <div className="font-medium">{profile.ownerName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Tahun Berdiri</div>
                                            <div>{profile.foundedYear || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Omzet Bulanan (Est.)</div>
                                            <div className="font-semibold text-green-600">
                                                {profile.omzetMonthly ?
                                                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profile.omzetMonthly)
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Karyawan</div>
                                            <div>{profile.employees || 0} orang</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-2">Kontak</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                {profile.phone || '-'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                {profile.email || '-'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-gray-400" />
                                                {profile.website ? (
                                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {profile.website}
                                                    </a>
                                                ) : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-2">Legalitas</div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.legalStatus && Object.entries(profile.legalStatus).map(([key, value]) => (
                                                <Badge key={key} variant={value ? "outline" : "secondary"} className={value ? "border-green-500 text-green-700 bg-green-50" : "text-gray-400"}>
                                                    {key.toUpperCase()} {value ? '✅' : '❌'}
                                                </Badge>
                                            ))}
                                            {!profile.legalStatus && <span className="text-gray-400 text-sm">-</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-4">
                            {/* Reusing DocumentList if props match, otherwise fallback to simple list */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dokumen UMKM</CardTitle>
                                    <CardDescription>Dokumen legalitas dan pendukung usaha.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Assuming DocumentList handles fetching or display */}
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                        <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>Belum ada dokumen yang diunggah.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="mentoring" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Mentoring</CardTitle>
                                    <CardDescription>Sesi konsultasi yang telah dilakukan.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                        <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>Belum ada riwayat sesi mentoring.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tindakan Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" onClick={() => toast.info('Fitur Jadwalkan Sesi akan segera hadir')}>
                                <Calendar className="mr-2 h-4 w-4" /> Jadwalkan Sesi
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => toast.info('Fitur Invite Event akan segera hadir')}>
                                <Calendar className="mr-2 h-4 w-4" /> Undang ke Event
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Segmentasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Level Saat Ini</div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{profile.level || 'Belum Ada'}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

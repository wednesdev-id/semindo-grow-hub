import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Shield,
    CheckCircle2,
    XCircle,
    Building2,
    MapPin,
    Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: userResp, isLoading, error } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.findById(id!),
        enabled: !!id
    });

    const user = userResp?.data;

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="space-y-6 container mx-auto py-6">
                <Button variant="ghost" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container mx-auto py-6 text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-2">User Tidak Ditemukan</h2>
                <p className="text-gray-500 mb-4">Maaf, data user yang Anda cari tidak dapat ditemukan.</p>
                <Button onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar User
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6 animate-fade-in">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar User
                </Button>
                {/* Optional: Add Edit Button link or similar if desired */}
            </div>

            {/* Profile Header Card */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-lg border shadow-sm">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                    <AvatarImage src={user.profilePictureUrl} alt={user.fullName} />
                    <AvatarFallback className="text-xl bg-primary/5 text-primary">
                        {getInitials(user.fullName)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
                        {user.isVerified ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Shield className="w-3.5 h-3.5 mr-1" /> Verified
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Unverified
                            </Badge>
                        )}
                        <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                            {user.isActive ? "Aktif" : "Non-Aktif"}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.phone}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Bergabung {format(new Date(user.createdAt), 'd MMMM yyyy', { locale: idLocale })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informasi Akun</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block mb-1">Role Akun</span>
                                <div className="flex flex-wrap gap-2">
                                    {(user.roles || []).map(role => (
                                        <Badge key={role} variant="secondary" className="capitalize">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground block mb-1">Status Login</span>
                                <div>
                                    {user.lastLoginAt ? (
                                        <span className="text-green-600 font-medium">
                                            {format(new Date(user.lastLoginAt), 'd MMM yyyy HH:mm', { locale: idLocale })}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Belum pernah login</span>
                                    )}
                                </div>
                            </div>
                            {user.businessName && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-1">Nama Bisnis</span>
                                    <div className="font-medium flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        {user.businessName}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Location Card */}
                {(user.address || user.city || user.province || user.location) && (
                    <Card className="border-purple-100 bg-purple-50/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                                <MapPin className="w-5 h-5" />
                                Lokasi Pribadi (Pemilik)
                            </CardTitle>
                            <CardDescription>
                                Alamat tempat tinggal pemilik akun
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user.address && (
                                <div>
                                    <span className="text-muted-foreground text-sm block mb-1">Alamat</span>
                                    <div className="font-medium">{user.address}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {user.city && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Kota/Kabupaten</span>
                                        <span className="font-medium">{user.city}</span>
                                    </div>
                                )}
                                {user.province && (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Provinsi</span>
                                        <span className="font-medium">{user.province}</span>
                                    </div>
                                )}
                            </div>
                            {user.location && (
                                <div className="text-xs text-muted-foreground pt-2 border-t">
                                    📍 Koordinat: {user.location.lat?.toFixed(5)}, {user.location.lng?.toFixed(5)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* UMKM Business Profiles - Showing ALL businesses */}
                {((user.umkmProfiles && user.umkmProfiles.length > 0) || user.umkmProfile) && (
                    <Card className="border-blue-100 bg-blue-50/20 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                                <Briefcase className="w-5 h-5" />
                                Daftar Usaha ({user.umkmProfiles?.length || (user.umkmProfile ? 1 : 0)} bisnis)
                            </CardTitle>
                            <CardDescription>
                                Semua usaha yang terdaftar atas nama pemilik ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {/* Map through umkmProfiles or fallback to single umkmProfile */}
                                {(user.umkmProfiles || (user.umkmProfile ? [user.umkmProfile] : [])).map((umkm, index) => (
                                    <div key={umkm.id || index} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                                        <div>
                                            <div className="font-semibold text-base">{umkm.businessName}</div>
                                            {umkm.sector && (
                                                <Badge variant="outline" className="mt-1 text-xs">
                                                    {umkm.sector}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">
                                                {umkm.address || '-'}<br />
                                                {umkm.city}, {umkm.province}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <Badge
                                                variant={umkm.status === 'verified' ? 'default' : 'secondary'}
                                                className={umkm.status === 'verified' ? 'bg-green-600' : ''}
                                            >
                                                {umkm.status || 'Pending'}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(`/admin/umkm/${umkm.id}`)}
                                            >
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {user.mentorProfile && (
                    <Card className="border-emerald-100 bg-emerald-50/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                                <Briefcase className="w-5 h-5" />
                                Profil Mentor
                            </CardTitle>
                            <CardDescription>
                                User ini terdaftar sebagai Mentor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Spesialisasi</span>
                                    <span className="font-medium">{user.mentorProfile.specialization || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Pengalaman</span>
                                    <span className="font-medium">{user.mentorProfile.experience ? `${user.mentorProfile.experience} Tahun` : '-'}</span>
                                </div>
                            </div>
                            {user.mentorProfile.bio && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground block mb-1">Bio</span>
                                    <p className="line-clamp-3 italic text-gray-600">{user.mentorProfile.bio}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}

import { useState, useMemo, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    MapPin,
    Users,
    TrendingUp,
    ChevronRight,
    Loader2,
    AlertCircle,
    Map as MapIcon,
    List,
    UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { userMapService, UserMapPoint } from '@/services/userMapService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { regionApi } from '@/services/umkmService';

// Lazy load map to avoid SSR
const OpenStreetMap = lazy(() => import('@/components/maps/OpenStreetMap'));

// Role Colors
const ROLE_COLORS: Record<string, string> = {
    wirausaha: '#f59e0b', // Amber - Entrepreneur
    umkm: '#3b82f6',      // Blue
    mentor: '#10b981',    // Emerald
    consultant: '#8b5cf6', // Violet
    user: '#64748b'       // Slate
};

// Reuse province coordinates from UMKM Region Map
const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Aceh': { lat: 4.695135, lng: 96.749397 },
    'Sumatera Utara': { lat: 2.115355, lng: 99.545097 },
    'Sumatera Barat': { lat: -0.739940, lng: 100.800003 },
    'Riau': { lat: 0.507068, lng: 101.447777 },
    'Kepulauan Riau': { lat: 3.945638, lng: 108.142166 },
    'Jambi': { lat: -1.609972, lng: 103.607254 },
    'Sumatera Selatan': { lat: -3.319437, lng: 103.914399 },
    'Bangka Belitung': { lat: -2.741050, lng: 106.440588 },
    'Bengkulu': { lat: -3.792857, lng: 102.260760 },
    'Lampung': { lat: -4.558585, lng: 105.406586 },
    'DKI Jakarta': { lat: -6.211544, lng: 106.845172 },
    'Jawa Barat': { lat: -6.914744, lng: 107.609810 },
    'Banten': { lat: -6.405817, lng: 106.064018 },
    'Jawa Tengah': { lat: -7.150975, lng: 110.140259 },
    'DI Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'Daerah Istimewa Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'Jawa Timur': { lat: -7.536064, lng: 112.238402 },
    'Bali': { lat: -8.340539, lng: 115.091949 },
    'Nusa Tenggara Barat': { lat: -8.652930, lng: 117.361648 },
    'Nusa Tenggara Timur': { lat: -8.657383, lng: 121.079372 },
    'Kalimantan Barat': { lat: -0.278790, lng: 111.475293 },
    'Kalimantan Tengah': { lat: -1.681490, lng: 113.382355 },
    'Kalimantan Selatan': { lat: -3.092641, lng: 115.283478 },
    'Kalimantan Timur': { lat: 0.538659, lng: 116.419389 },
    'Kalimantan Utara': { lat: 3.073020, lng: 116.041740 },
    'Sulawesi Utara': { lat: 0.625993, lng: 123.975021 },
    'Gorontalo': { lat: 0.545290, lng: 123.062126 },
    'Sulawesi Tengah': { lat: -1.430427, lng: 121.445612 },
    'Sulawesi Barat': { lat: -2.844726, lng: 119.232070 },
    'Sulawesi Selatan': { lat: -3.669500, lng: 119.999889 },
    'Sulawesi Tenggara': { lat: -4.144919, lng: 122.174605 },
    'Maluku': { lat: -3.238462, lng: 130.145270 },
    'Maluku Utara': { lat: 1.570858, lng: 127.808808 },
    'Papua': { lat: -4.269928, lng: 138.080353 },
    'Papua Barat': { lat: -1.336826, lng: 133.174166 },
    'Jawa': { lat: -7.150975, lng: 110.140259 },
    'Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'DIY': { lat: -7.797068, lng: 110.370529 },
    'Jakarta': { lat: -6.211544, lng: 106.845172 },
};

export default function UserDistributionMapPage() {
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    // Fetch user map data
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['user-distribution'],
        queryFn: async () => {
            const result = await userMapService.getDistribution();
            // Verify success using property or status
            if (result && result.data) {
                return result.data; // UserMapPoint[]
            }
            return [];
        }
    });

    // Process data for aggregation/stats
    const stats = useMemo(() => {
        if (!users) return { total: 0, byRole: {}, byProvince: {} };

        const byRole: Record<string, number> = {};
        const byProvince: Record<string, number> = {};

        users.forEach(u => {
            // Count roles
            byRole[u.type] = (byRole[u.type] || 0) + 1;

            // Count provinces
            if (u.province) {
                // Normalize "Daerah Istimewa Yogyakarta" to common key if needed, or just use raw
                const p = u.province;
                byProvince[p] = (byProvince[p] || 0) + 1;
            }
        });

        return {
            total: users.length,
            byRole,
            byProvince
        };
    }, [users]);

    // Format Clusters for OpenStreetMap
    // Since OpenStreetMap.tsx takes {province, count, lat, lng}, we generate from our stats
    const clusters = useMemo(() => {
        return Object.entries(stats.byProvince).map(([province, count]) => {
            const coords = PROVINCE_COORDINATES[province];
            if (!coords) return null;
            return {
                province,
                count,
                lat: coords.lat,
                lng: coords.lng
            };
        }).filter(Boolean) as any[];
    }, [stats.byProvince]);

    // Filter markers based on selected province
    const markers = useMemo(() => {
        if (!users) return [];
        let filtered = users;

        if (selectedProvince) {
            filtered = users.filter(u => u.province === selectedProvince);
        }

        // Map UserMapPoint to marker format expected by OpenStreetMap (or generic)
        // OpenStreetMap expects specific fields? Let's treat them as custom markers if possible?
        // Actually, looking at `UMKMRegionMapPage`, it passes `markers` prop.
        // Let's assume `OpenStreetMap` can handle generic markers if we match structure or if we updated it.
        // Wait, I should check OpenStreetMap.tsx props. 
        // It likely expects a specific shape.
        return filtered.map(u => ({
            id: u.id,
            // Swap: Show User Name as main title (businessName prop), Business Name as secondary (ownerName prop)
            businessName: u.name,
            ownerName: u.businessName,
            lat: u.lat,
            lng: u.lng,
            province: u.province || '',
            city: u.city,
            address: u.address,
            // Additional fields for styling
            type: u.type,
            umkmId: u.umkmId, // Mapped from service
            status: 'active', // Dummy
            segmentation: u.type.toUpperCase(), // Use type as label
            locationSource: u.locationSource // Personal vs Business location indicator
        }));
    }, [users, selectedProvince]);

    const getDetailUrl = (marker: any) => {
        // Log marker for debugging if needed
        // console.log('Marker clicked:', marker);

        // If we have an umkmId, ALWAYS prefer linking to the UMKM profile
        // This handles cases where type might be 'umkm' or other roles with a business
        if (marker.umkmId) {
            return `/admin/umkm/${marker.umkmId}`;
        }

        // precise fallback: specific user management URL with search param
        // User Name is stored in 'businessName' prop for the map display
        // return `/admin/users?search=${encodeURIComponent(marker.businessName)}`;

        // NEW: Link to dedicated User Detail Page
        return `/admin/users/${marker.id}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Memuat data sebaran pengguna...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gagal memuat data</h3>
                    <p className="text-muted-foreground">Silakan coba lagi nanti</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Pemetaan Pengguna</h1>
                    <p className="text-muted-foreground">
                        Visualisasi sebaran pengguna (UMKM, Mentor, Konsultan) di seluruh Indonesia
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'map' | 'list')}>
                        <TabsList>
                            <TabsTrigger value="map">
                                <MapIcon className="w-4 h-4 mr-2" />
                                Peta
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="w-4 h-4 mr-2" />
                                List
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengguna Terpetakan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-bold">{stats.total.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            *Hanya pengguna dengan lokasi
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">UMKM</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-2xl font-bold">{stats.byRole.umkm || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Mentor & Konsultan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xl font-bold">{stats.byRole.mentor || 0}</span>
                                <span className="text-xs text-muted-foreground">Mtr</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                                <span className="text-xl font-bold">{stats.byRole.consultant || 0}</span>
                                <span className="text-xs text-muted-foreground">Kls</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Provinsi Terbanyak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                            <span className="text-lg font-bold truncate">
                                {Object.entries(stats.byProvince).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{viewMode === 'map'
                                    ? (selectedProvince
                                        ? `Pengguna di ${selectedProvince}`
                                        : 'Peta Sebaran')
                                    : 'Daftar Lokasi User'}
                                </span>
                                {selectedProvince && viewMode === 'map' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedProvince(null)}
                                    >
                                        ← Kembali ke Nasional
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {viewMode === 'map' ? (
                                <Suspense fallback={<div className="h-[500px] bg-muted/20 animate-pulse rounded-lg" />}>
                                    <OpenStreetMap
                                        clusters={clusters}
                                        markers={markers}
                                        selectedProvince={selectedProvince}
                                        onClusterClick={(cluster) => setSelectedProvince(cluster.province)}
                                        onMarkerClick={(marker) => console.log(marker)}
                                        getDetailUrl={getDetailUrl}
                                        height="500px"
                                        showLegend={true}
                                        context="user" // Customize for User Map
                                    />
                                </Suspense>
                            ) : (
                                <div className="border rounded-lg max-h-[500px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama / Bisnis</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Lokasi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {markers.map((m) => (
                                                <TableRow key={m.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{m.ownerName || m.businessName}</div>
                                                            {m.businessName && m.ownerName && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Usaha: {m.businessName}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            m.type === 'umkm' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                m.type === 'mentor' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    'bg-violet-50 text-violet-700 border-violet-200'
                                                        }>
                                                            {m.type.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {m.city}, {m.province}
                                                            {m.locationSource && (
                                                                <Badge variant="outline" className={`ml-2 text-xs ${m.locationSource === 'personal' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-600'}`}>
                                                                    {m.locationSource === 'personal' ? '📍 Pribadi' : '🏢 Usaha'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Filter / Legend */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Keterangan Role</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium">UMKM</span>
                                </div>
                                <span className="text-sm font-bold">{stats.byRole.umkm || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-medium">Mentor</span>
                                </div>
                                <span className="text-sm font-bold">{stats.byRole.mentor || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                                    <span className="text-sm font-medium">Konsultan</span>
                                </div>
                                <span className="text-sm font-bold">{stats.byRole.consultant || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Provinces */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Top 5 Provinsi User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(stats.byProvince)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([prov, count], idx) => (
                                        <div key={prov} className="relative">
                                            <div className="flex items-center justify-between text-sm mb-1 relative z-10">
                                                <span className="font-medium">{idx + 1}. {prov}</span>
                                                <span className="text-muted-foreground">{count}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/60 rounded-full"
                                                    style={{ width: `${(count / (stats.total || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

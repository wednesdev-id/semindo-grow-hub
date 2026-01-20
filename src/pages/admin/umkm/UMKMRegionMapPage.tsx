import { useState, useMemo, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    MapPin,
    Building2,
    TrendingUp,
    ChevronRight,
    Loader2,
    AlertCircle,
    Map as MapIcon,
    List,
    BarChart3,
    Eye,
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
import { regionApi, type ProvinceData, type RegionStats, type MapDataPoint } from '@/services/umkmService';

// Lazy load the map component to avoid SSR issues
const OpenStreetMap = lazy(() => import('@/components/maps/OpenStreetMap'));

const SEGMENTATION_COLORS: Record<string, string> = {
    Pemula: '#3b82f6',
    Madya: '#f59e0b',
    Utama: '#10b981',
    Unknown: '#9ca3af',
};

// Province coordinates
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
    // Common variations
    'Jawa': { lat: -7.150975, lng: 110.140259 },
    'Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'DIY': { lat: -7.797068, lng: 110.370529 },
    'Jakarta': { lat: -6.211544, lng: 106.845172 },
};

function ProvinceStatsCard({ stats, onClose }: { stats: RegionStats; onClose: () => void }) {
    const totalSegmentation = Object.values(stats.bySegmentation).reduce((a, b) => a + b, 0);

    return (
        <Card className="animate-in slide-in-from-right">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{stats.province}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
                </div>
                <CardDescription>Statistik UMKM di provinsi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats.totalUMKM}</div>
                        <div className="text-xs text-muted-foreground">Total UMKM</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-emerald-500">{stats.verifiedCount}</div>
                        <div className="text-xs text-muted-foreground">Terverifikasi</div>
                    </div>
                </div>

                <div>
                    <div className="text-sm font-medium mb-2">Segmentasi</div>
                    <div className="space-y-2">
                        {Object.entries(stats.bySegmentation).map(([name, count]) => (
                            <div key={name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: SEGMENTATION_COLORS[name] || '#9ca3af' }}
                                />
                                <span className="text-sm flex-1">{name}</span>
                                <span className="text-sm font-medium">{count}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({totalSegmentation > 0 ? Math.round((count / totalSegmentation) * 100) : 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">Rata-rata Omzet</div>
                        <div className="font-medium">
                            {stats.avgTurnover >= 1_000_000_000
                                ? `Rp ${(stats.avgTurnover / 1_000_000_000).toFixed(1)} M`
                                : `Rp ${(stats.avgTurnover / 1_000_000).toFixed(0)} Jt`}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Rata-rata Karyawan</div>
                        <div className="font-medium">{stats.avgEmployees} orang</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function UMKMRegionMapPage() {
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    // Auto-show markers when province is selected (Skool-like behavior)
    const showMarkers = selectedProvince !== null;

    // Fetch provinces data
    const { data: provinces, isLoading: provincesLoading, error: provincesError } = useQuery({
        queryKey: ['region-provinces'],
        queryFn: regionApi.getProvinces,
    });

    // Fetch selected province stats
    const { data: provinceStats, isLoading: statsLoading } = useQuery({
        queryKey: ['region-province-stats', selectedProvince],
        queryFn: () => selectedProvince ? regionApi.getProvinceStats(selectedProvince) : null,
        enabled: !!selectedProvince,
    });

    // Fetch map data (UMKM markers) - always fetch when province is selected for drill-down
    const { data: mapData, isLoading: mapDataLoading } = useQuery({
        queryKey: ['region-map-data', selectedProvince],
        queryFn: () => regionApi.getMapData({
            province: selectedProvince || undefined,
            limit: selectedProvince ? 500 : 100, // More markers when drilling down
        }),
        enabled: true, // Always fetch for display
    });

    // Sort provinces by count
    const sortedProvinces = useMemo(() => {
        if (!provinces) return [];
        return [...provinces].sort((a, b) => b.count - a.count);
    }, [provinces]);

    // Calculate totals
    const totals = useMemo(() => {
        if (!provinces) return { total: 0, provinces: 0 };
        return {
            total: provinces.reduce((sum, p) => sum + p.count, 0),
            provinces: provinces.filter(p => p.count > 0).length,
        };
    }, [provinces]);

    // Convert provinces to clusters for map
    const clusters = useMemo(() => {
        if (!provinces) return [];
        return provinces
            .filter(p => PROVINCE_COORDINATES[p.province])
            .map(p => ({
                province: p.province,
                count: p.count,
                lat: PROVINCE_COORDINATES[p.province].lat,
                lng: PROVINCE_COORDINATES[p.province].lng,
            }));
    }, [provinces]);

    // Convert map data to markers
    const markers = useMemo(() => {
        if (!mapData || !showMarkers) return [];
        return mapData
            .filter((m: MapDataPoint) => m.lat && m.lng)
            .map((m: MapDataPoint) => ({
                id: m.id,
                businessName: m.businessName,
                ownerName: m.ownerName,
                lat: m.lat!,
                lng: m.lng!,
                province: m.province,
                city: m.city,
                segmentation: m.segmentation,
                level: m.level,
                sector: m.sector || undefined,
                turnover: m.turnover,
                employees: m.employees,
                status: m.status,
            }));
    }, [mapData, showMarkers]);

    // Show loading state during initial load
    if (provincesLoading && !provinces) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Memuat data wilayah...</h3>
                    <p className="text-muted-foreground">Mohon tunggu sebentar</p>
                </div>
            </div>
        );
    }

    if (provincesError) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Region Mapping</h1>
                    <p className="text-muted-foreground">
                        Pemetaan dan sebaran UMKM di seluruh Indonesia dengan OpenStreetMap
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total UMKM
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-bold">
                                {provincesLoading ? '...' : totals.total.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Provinsi Terjangkau
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            <span className="text-2xl font-bold">
                                {provincesLoading ? '...' : totals.provinces}
                            </span>
                            <span className="text-sm text-muted-foreground">/ 38</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Provinsi Terbanyak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <span className="text-lg font-bold truncate">
                                {provincesLoading ? '...' : sortedProvinces[0]?.province || '-'}
                            </span>
                        </div>
                        {sortedProvinces[0] && (
                            <div className="text-sm text-muted-foreground">
                                {sortedProvinces[0].count.toLocaleString('id-ID')} UMKM
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Rata-rata per Provinsi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold">
                                {provincesLoading
                                    ? '...'
                                    : totals.provinces > 0
                                        ? Math.round(totals.total / totals.provinces)
                                        : 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map / List View */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{viewMode === 'map'
                                    ? (selectedProvince
                                        ? `UMKM di ${selectedProvince}`
                                        : 'Peta Sebaran UMKM Indonesia')
                                    : 'Daftar Provinsi'}
                                </span>
                                {selectedProvince && viewMode === 'map' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedProvince(null)}
                                    >
                                        ← Kembali ke Peta Indonesia
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {viewMode === 'map'
                                    ? (selectedProvince
                                        ? `Menampilkan ${markers.length} UMKM. Klik marker untuk melihat detail.`
                                        : 'Klik pada lingkaran provinsi untuk zoom in dan melihat UMKM di area tersebut.')
                                    : 'Klik pada baris untuk melihat detail'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {provincesLoading ? (
                                <div className="flex items-center justify-center h-[500px]">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : viewMode === 'map' ? (
                                <Suspense fallback={
                                    <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                }>
                                    <OpenStreetMap
                                        clusters={clusters}
                                        markers={markers}
                                        selectedProvince={selectedProvince}
                                        onClusterClick={(cluster) => setSelectedProvince(cluster.province)}
                                        onMarkerClick={(marker) => {
                                            // Could navigate to UMKM detail page
                                            console.log('Marker clicked:', marker);
                                        }}
                                        height="500px"
                                        showLegend={true}
                                    />
                                </Suspense>
                            ) : (
                                <div className="border rounded-lg max-h-[500px] overflow-auto">
                                    {!selectedProvince ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Provinsi</TableHead>
                                                    <TableHead className="text-right">Jumlah UMKM</TableHead>
                                                    <TableHead className="text-right">%</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedProvinces.map((prov, idx) => (
                                                    <TableRow
                                                        key={prov.province}
                                                        className={`cursor-pointer hover:bg-muted/50 transition-colors`}
                                                        onClick={() => setSelectedProvince(prov.province)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-muted-foreground w-6">{idx + 1}.</span>
                                                                <span className="font-medium">{prov.province}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {prov.count.toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="text-right text-muted-foreground">
                                                            {totals.total > 0 ? Math.round((prov.count / totals.total) * 100) : 0}%
                                                        </TableCell>
                                                        <TableCell>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="p-0">
                                            <div className="p-4 border-b bg-muted/20 flex justify-between items-center sticky top-0 bg-background z-10">
                                                <h3 className="font-semibold text-lg">
                                                    Daftar UMKM di {selectedProvince}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedProvince(null)}
                                                >
                                                    ← Kembali ke Daftar Provinsi
                                                </Button>
                                            </div>
                                            {mapDataLoading ? (
                                                <div className="flex justify-center p-8">
                                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : markers.length === 0 ? (
                                                <div className="text-center p-8 text-muted-foreground">
                                                    Tidak ada data UMKM yang ditemukan di wilayah ini.
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nama Usaha</TableHead>
                                                            <TableHead>Pemilik</TableHead>
                                                            <TableHead>Kota/Kab</TableHead>
                                                            <TableHead>Skala</TableHead>
                                                            <TableHead>Omset</TableHead>
                                                            <TableHead className="text-right">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {markers.map((marker) => (
                                                            <TableRow key={marker.id}>
                                                                <TableCell className="font-medium">
                                                                    {marker.businessName}
                                                                </TableCell>
                                                                <TableCell>{marker.ownerName}</TableCell>
                                                                <TableCell>{marker.city}</TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        style={{
                                                                            borderColor: SEGMENTATION_COLORS[marker.segmentation] || '#9ca3af',
                                                                            color: SEGMENTATION_COLORS[marker.segmentation] || '#9ca3af'
                                                                        }}
                                                                    >
                                                                        {marker.segmentation}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {marker.turnover ?
                                                                        `Rp ${(marker.turnover / 1_000_000).toFixed(0)} Jt` :
                                                                        '-'
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {/* Reuse getDetailUrl logic implicitly or link directly */}
                                                                    <Button asChild size="sm" variant="outline">
                                                                        <a href={`/admin/umkm/${marker.id}`}>Detail</a>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Selected Province Stats */}
                <div>
                    {selectedProvince ? (
                        statsLoading ? (
                            <Card>
                                <CardContent className="flex items-center justify-center h-[300px]">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ) : provinceStats ? (
                            <ProvinceStatsCard
                                stats={provinceStats}
                                onClose={() => setSelectedProvince(null)}
                            />
                        ) : null
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Pilih provinsi untuk melihat detail</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Top 5 Provinces */}
                    <Card className="mt-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Top 5 Provinsi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sortedProvinces.slice(0, 5).map((prov, idx) => (
                                    <button
                                        key={prov.province}
                                        onClick={() => setSelectedProvince(prov.province)}
                                        className={`w-full text-left p-2 rounded-lg transition-colors
                                            ${selectedProvince === prov.province ? 'bg-primary/10' : 'hover:bg-muted'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="w-6 justify-center">
                                                {idx + 1}
                                            </Badge>
                                            <span className="flex-1 text-sm font-medium truncate">
                                                {prov.province}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {prov.count.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden ml-8">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{
                                                    width: `${(prov.count / (sortedProvinces[0]?.count || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Legend Info */}
                    {viewMode === 'map' && (
                        <Card className="mt-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Panduan Peta</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-muted-foreground">
                                <p>• <strong>Lingkaran biru</strong>: Jumlah UMKM per provinsi</p>
                                <p>• <strong>Ukuran lingkaran</strong>: Semakin besar = semakin banyak UMKM</p>
                                {showMarkers && (
                                    <>
                                        <p className="pt-2 font-medium text-foreground">Warna Marker:</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                                            <span>Pemula</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                                            <span>Madya</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
                                            <span>Utama</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Building2,
    Users,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { segmentationApi, type SegmentationStats, type UMKMSegmentItem } from '@/services/umkmService';

const SEGMENTATION_COLORS: Record<string, string> = {
    Pemula: 'bg-blue-500',
    Madya: 'bg-amber-500',
    Utama: 'bg-emerald-500',
};

const LEVEL_COLORS: Record<string, string> = {
    Mikro: 'bg-slate-400',
    Kecil: 'bg-violet-500',
    Menengah: 'bg-rose-500',
};

function formatCurrency(amount: number | null): string {
    if (!amount) return '-';
    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
    }
    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(0)} Jt`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

function SegmentationPieChart({ data }: { data: { name: string; count: number; percentage: number }[] }) {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let startAngle = 0;

    return (
        <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((item, idx) => {
                        const angle = (item.percentage / 100) * 360;
                        const endAngle = startAngle + angle;

                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);

                        const largeArc = angle > 180 ? 1 : 0;

                        const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        startAngle = endAngle;

                        const colorClass = SEGMENTATION_COLORS[item.name] || 'bg-gray-400';
                        // Extract color from Tailwind class
                        const colorMap: Record<string, string> = {
                            'bg-blue-500': '#3b82f6',
                            'bg-amber-500': '#f59e0b',
                            'bg-emerald-500': '#10b981',
                        };
                        const fillColor = colorMap[colorClass] || '#9ca3af';

                        return (
                            <path
                                key={item.name}
                                d={pathData}
                                fill={fillColor}
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        );
                    })}
                    <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-slate-900" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold">{total}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${SEGMENTATION_COLORS[item.name] || 'bg-gray-400'}`} />
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">({item.count})</span>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function UMKMSegmentationPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
        segmentation: '',
        level: '',
        search: '',
        page: 1,
        limit: 10,
    });

    // Fetch stats
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['segmentation-stats'],
        queryFn: segmentationApi.getStats,
    });

    // Fetch list
    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ['segmentation-list', filters],
        queryFn: () => segmentationApi.getList({
            ...filters,
            segmentation: filters.segmentation || undefined,
            level: filters.level || undefined,
            search: filters.search || undefined,
        }),
    });

    // Bulk recalculate mutation
    const bulkRecalculateMutation = useMutation({
        mutationFn: segmentationApi.bulkRecalculate,
        onSuccess: (result) => {
            toast.success(`Berhasil memproses ${result.processed} UMKM, ${result.updated} diperbarui`);
            queryClient.invalidateQueries({ queryKey: ['segmentation-stats'] });
            queryClient.invalidateQueries({ queryKey: ['segmentation-list'] });
        },
        onError: () => {
            toast.error('Gagal melakukan recalculate segmentasi');
        },
    });

    const handleFilterChange = (key: string, value: string) => {
        // Convert 'all' to empty string for API compatibility
        const actualValue = value === 'all' ? '' : value;
        setFilters((prev) => ({ ...prev, [key]: actualValue, page: 1 }));
    };

    // Show loading state during initial load
    if (statsLoading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Memuat data segmentasi...</h3>
                    <p className="text-muted-foreground">Mohon tunggu sebentar</p>
                </div>
            </div>
        );
    }

    if (statsError) {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Segmentasi UMKM</h1>
                    <p className="text-muted-foreground">
                        Analisis dan pengelompokan UMKM berdasarkan omzet dan aset
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => bulkRecalculateMutation.mutate()}
                    disabled={bulkRecalculateMutation.isPending}
                >
                    {bulkRecalculateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Recalculate All
                </Button>
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
                                {statsLoading ? '...' : stats?.total.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Baru Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold">
                                {statsLoading ? '...' : stats?.trends.newThisMonth}
                            </span>
                            {stats && stats.trends.growthRate > 0 && (
                                <Badge variant="default" className="bg-emerald-500">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {stats.trends.growthRate}%
                                </Badge>
                            )}
                            {stats && stats.trends.growthRate < 0 && (
                                <Badge variant="destructive">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    {Math.abs(stats.trends.growthRate)}%
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Segmentation breakdown */}
                {['Pemula', 'Madya', 'Utama'].map((seg) => {
                    const segData = stats?.bySegmentation.find((s) => s.name === seg);
                    return (
                        <Card key={seg}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${SEGMENTATION_COLORS[seg]}`} />
                                    {seg}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">
                                        {statsLoading ? '...' : segData?.count || 0}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ({segData?.percentage || 0}%)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Segmentasi</CardTitle>
                        <CardDescription>Pembagian UMKM berdasarkan kategori bisnis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : stats?.bySegmentation ? (
                            <SegmentationPieChart data={stats.bySegmentation} />
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Provinsi</CardTitle>
                        <CardDescription>Provinsi dengan UMKM terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats?.byProvince.slice(0, 5).map((prov, idx) => (
                                    <div key={prov.province} className="flex items-center gap-3">
                                        <span className="w-6 text-muted-foreground text-sm">{idx + 1}.</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{prov.province}</span>
                                                <span className="text-sm text-muted-foreground">{prov.count}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${prov.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar UMKM</CardTitle>
                    <CardDescription>Filter dan cari UMKM berdasarkan segmentasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama usaha atau pemilik..."
                                className="pl-9"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                        <Select
                            value={filters.segmentation || 'all'}
                            onValueChange={(value) => handleFilterChange('segmentation', value)}
                        >
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Segmentasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="Pemula">Pemula</SelectItem>
                                <SelectItem value="Madya">Madya</SelectItem>
                                <SelectItem value="Utama">Utama</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.level || 'all'}
                            onValueChange={(value) => handleFilterChange('level', value)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="Mikro">Mikro</SelectItem>
                                <SelectItem value="Kecil">Kecil</SelectItem>
                                <SelectItem value="Menengah">Menengah</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Usaha</TableHead>
                                    <TableHead>Pemilik</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Segmentasi</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead className="text-right">Omzet</TableHead>
                                    <TableHead className="text-right">Karyawan</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : listData?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data yang ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listData?.data.map((item: UMKMSegmentItem) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.businessName}</TableCell>
                                            <TableCell>{item.ownerName}</TableCell>
                                            <TableCell>
                                                {item.city && item.province
                                                    ? `${item.city}, ${item.province}`
                                                    : item.province || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={SEGMENTATION_COLORS[item.segmentation || ''] + ' text-white'}>
                                                    {item.segmentation || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={LEVEL_COLORS[item.level || ''] ? 'border-0 text-white ' + LEVEL_COLORS[item.level || ''] : ''}>
                                                    {item.level || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(item.turnover)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.employees || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Link to={`/umkm/${item.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {listData?.meta && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Menampilkan {((listData.meta.page - 1) * listData.meta.limit) + 1} -{' '}
                                {Math.min(listData.meta.page * listData.meta.limit, listData.meta.total)} dari{' '}
                                {listData.meta.total} UMKM
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page >= listData.meta.totalPages}
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

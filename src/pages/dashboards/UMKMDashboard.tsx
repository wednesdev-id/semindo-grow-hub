import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Package, Star, TrendingUp, BookOpen, Award, AlertCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { financingService } from '@/services/financingService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function UMKMDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: dashboardService.getOverview
    });

    const { data: loanApplications } = useQuery({
        queryKey: ['my-loan-applications'],
        queryFn: financingService.getMyApplications
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                    <Skeleton className="col-span-3 h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Data Tidak Tersedia</h3>
                    <p className="text-sm text-muted-foreground">
                        Tidak ada data yang diterima dari server.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <Button asChild>
                    <Link to="/marketplace/seller">
                        <Package className="mr-2 h-4 w-4" />
                        Kelola Produk
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Rp {data.stats.totalSales.toLocaleString('id-ID')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Order Aktif</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 order baru hari ini
                        </p>
                    </CardContent>
                </Card>
                <Link to="/marketplace/seller">
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.stats.totalProducts}</div>
                            <p className="text-xs text-primary font-medium mt-1">
                                Klik untuk kelola produk →
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating Toko</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.averageRating}</div>
                        <p className="text-xs text-muted-foreground">
                            Berdasarkan 150 ulasan
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview Penjualan</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.salesChart}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `Rp${value / 1000000}jt`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
                                    />
                                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders & LMS Progress */}
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {data.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{order.customer}</p>
                                            <p className="text-sm text-muted-foreground">{order.id}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            Rp {order.amount.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progress Belajar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <BookOpen className="mx-auto h-5 w-5 text-muted-foreground" />
                                    <div className="text-2xl font-bold">{data.lmsProgress.completedCourses}</div>
                                    <div className="text-xs text-muted-foreground">Selesai</div>
                                </div>
                                <div className="space-y-1">
                                    <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground" />
                                    <div className="text-2xl font-bold">{data.lmsProgress.inProgressCourses}</div>
                                    <div className="text-xs text-muted-foreground">Sedang Belajar</div>
                                </div>
                                <div className="space-y-1">
                                    <Award className="mx-auto h-5 w-5 text-muted-foreground" />
                                    <div className="text-2xl font-bold">{data.lmsProgress.totalCertificates}</div>
                                    <div className="text-xs text-muted-foreground">Sertifikat</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status Pembiayaan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loanApplications && loanApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {loanApplications.slice(0, 2).map((app) => (
                                        <div key={app.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{app.partner.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Rp {app.amount.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <Badge variant={app.status === 'APPROVED' ? 'default' : 'secondary'}>
                                                {app.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-2">Belum ada pengajuan</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to="/financing-hub">Ajukan Sekarang</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

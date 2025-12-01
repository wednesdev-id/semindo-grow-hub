import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Package, Star, TrendingUp, BookOpen, Award } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function UMKMDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: dashboardService.getOverview
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

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            5 produk perlu restock
                        </p>
                    </CardContent>
                </Card>
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
                </div>
            </div>
        </div>
    );
}

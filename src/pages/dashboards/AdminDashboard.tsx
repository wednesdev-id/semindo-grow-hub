import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, AlertCircle, CheckCircle, TrendingUp, ShoppingBag } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard-overview'],
        queryFn: dashboardService.getAdminOverview,
        retry: 1, // Only retry once
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

    if (error) {
        console.error('[AdminDashboard] Error:', error);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'An error occurred while fetching dashboard data'}
                    </p>
                </div>
                <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {data.stats.totalSales?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.stats.activeStores} Active Stores
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.activeUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((data.stats.activeUsers / (data.stats.totalUsers || 1)) * 100)}% engagement rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.systemHealth}%</div>
                        <p className="text-xs text-muted-foreground">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* User Growth Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Verifications Table */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.pendingVerifications.map((item) => (
                                <div key={item.id} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.businessName}</p>
                                        <p className="text-sm text-muted-foreground">{item.owner}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <Badge variant="outline">{item.date}</Badge>
                                        <Button size="sm" variant="secondary" asChild>
                                            <Link to={`/admin/verifications/${item.id}`}>Review</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {data.pendingVerifications.length === 0 && (
                                <p className="text-center text-muted-foreground">No pending verifications</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

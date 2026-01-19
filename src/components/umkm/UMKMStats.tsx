import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { Users, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface UMKMStatsData {
    total: number;
    verified: number;
    unverified: number;
    byLevel: { level: string; count: number }[];
}

export default function UMKMStats() {
    const [stats, setStats] = useState<UMKMStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get<UMKMStatsData>('/umkm/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader className="h-20" />
                    <CardContent className="h-10" />
                </Card>
            ))}
        </div>;
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total UMKM</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Registered businesses</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Verified</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.verified}</div>
                    <p className="text-xs text-muted-foreground">Fully verified profiles</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <XCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.unverified}</div>
                    <p className="text-xs text-muted-foreground">Awaiting verification</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Level</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>

                    <div className="text-2xl font-bold">
                        {[...stats.byLevel].sort((a, b) => b.count - a.count)[0]?.level || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Most common segment</p>
                </CardContent>
            </Card>
        </div>
    );
}

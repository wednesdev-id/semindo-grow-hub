import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { DollarSign, TrendingUp, TrendingDown, Users, Award, Target, Download, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RevenueSummary {
    totalRevenue: number;
    platformFee: number;
    consultantPayouts: number;
    todayRevenue: number;
    monthRevenue: number;
    totalSessions: number;
    platformFeeRate: number;
}

interface TopEarner {
    id: string;
    name: string;
    revenue: number;
    sessions: number;
}

interface TrendData {
    date: string;
    revenue: number;
    sessions: number;
}

interface KPIData {
    kpis: {
        consultantActivationRate: number;
        requestFulfillmentRate: number;
        cancellationRate: number;
        averageRating: number;
        requestGrowth: number;
    };
    counts: {
        totalConsultants: number;
        activeConsultants: number;
        totalRequests: number;
        completedRequests: number;
        cancelledRequests: number;
        pendingRequests: number;
        last30DaysRequests: number;
    };
}

export default function ReportsAnalytics() {
    const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
    const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [kpiData, setKPIData] = useState<KPIData | null>(null);
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadAllData();
    }, [period]);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadRevenueSummary(),
            loadRevenueTrends(),
            loadKPIMetrics()
        ]);
        setLoading(false);
    };

    const loadRevenueSummary = async () => {
        try {
            const response = await api.get<any>(`/consultation/admin/revenue/summary?period=${period}`);
            setRevenueSummary(response.summary);
            setTopEarners(response.topEarners || []);
        } catch (error) {
            console.error('Failed to load revenue summary:', error);
        }
    };

    const loadRevenueTrends = async () => {
        try {
            const response = await api.get<any>(`/consultation/admin/revenue/trends?period=${period}`);
            setTrendData(response.trends || []);
        } catch (error) {
            console.error('Failed to load revenue trends:', error);
        }
    };

    const loadKPIMetrics = async () => {
        try {
            const response = await api.get<KPIData>('/consultation/admin/kpi');
            setKPIData(response);
        } catch (error) {
            console.error('Failed to load KPI metrics:', error);
        }
    };

    const handleExport = async (type: 'revenue' | 'consultants', format: 'json' | 'csv') => {
        try {
            setExporting(true);
            const response = await api.post<any>('/consultation/admin/reports/export', {
                type,
                period,
                format
            });

            if (format === 'csv') {
                // For CSV, the response is the raw data
                const dataStr = typeof response === 'string' ? response : JSON.stringify(response);
                const blob = new Blob([dataStr], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-report-${period}.csv`;
                a.click();
            } else {
                const dataStr = JSON.stringify(response, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-report-${period}.json`;
                a.click();
            }
        } catch (error) {
            console.error('Failed to export report:', error);
            alert('Gagal mengexport report');
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}M`;
        }
        if (amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(0)}K`;
        }
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    };

    const getGrowthIndicator = (value: number) => {
        if (value > 0) {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        } else if (value < 0) {
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Analisis performa dan pendapatan konsultasi</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <div className="relative group">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            disabled={exporting}
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                            <button
                                onClick={() => handleExport('revenue', 'csv')}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                Revenue Report (CSV)
                            </button>
                            <button
                                onClick={() => handleExport('revenue', 'json')}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                Revenue Report (JSON)
                            </button>
                            <button
                                onClick={() => handleExport('consultants', 'csv')}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                Consultant Report (CSV)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Summary Cards */}
            {revenueSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(revenueSummary.totalRevenue)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-green-200" />
                        </div>
                        <p className="text-green-100 text-sm mt-2">{revenueSummary.totalSessions} sessions</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Platform Fee ({revenueSummary.platformFeeRate}%)</p>
                                <p className="text-2xl font-bold">{formatCurrency(revenueSummary.platformFee)}</p>
                            </div>
                            <Target className="w-10 h-10 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Consultant Payouts</p>
                                <p className="text-2xl font-bold">{formatCurrency(revenueSummary.consultantPayouts)}</p>
                            </div>
                            <Users className="w-10 h-10 text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">This Month</p>
                                <p className="text-2xl font-bold">{formatCurrency(revenueSummary.monthRevenue)}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-orange-200" />
                        </div>
                        <p className="text-orange-100 text-sm mt-2">Today: {formatCurrency(revenueSummary.todayRevenue)}</p>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            {kpiData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Activation Rate</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {kpiData.kpis.consultantActivationRate.toFixed(1)}%
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {kpiData.counts.activeConsultants} / {kpiData.counts.totalConsultants} consultants
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate</p>
                        <p className="text-xl font-bold text-green-600">
                            {kpiData.kpis.requestFulfillmentRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {kpiData.counts.completedRequests} / {kpiData.counts.totalRequests} requests
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cancellation Rate</p>
                        <p className="text-xl font-bold text-red-600">
                            {kpiData.kpis.cancellationRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {kpiData.counts.cancelledRequests} cancelled
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                        <p className="text-xl font-bold text-yellow-600">
                            {kpiData.kpis.averageRating.toFixed(1)} ⭐
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">30D Growth</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-xl font-bold ${kpiData.kpis.requestGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {kpiData.kpis.requestGrowth >= 0 ? '+' : ''}{kpiData.kpis.requestGrowth.toFixed(1)}%
                            </p>
                            {getGrowthIndicator(kpiData.kpis.requestGrowth)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {kpiData.counts.last30DaysRequests} requests
                        </p>
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sessions Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sessions Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                            <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} name="Sessions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Earners */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Top Earning Consultants
                </h2>
                {topEarners.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultant</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sessions</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topEarners.map((earner, index) => (
                                    <tr key={earner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3">
                                            <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                                                index === 1 ? 'text-gray-400' :
                                                    index === 2 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{earner.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{earner.sessions}</td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(earner.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

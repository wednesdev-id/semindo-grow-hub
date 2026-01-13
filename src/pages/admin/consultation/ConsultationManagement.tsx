import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Users, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Award, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsultantStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface ConsultationRequestStats {
    total: number;
    pending: number;
    approved: number;
    completed: number;
}

interface QualityMetrics {
    averageRating: number;
    responseRate: number;
    completionRate: number;
    noShowRate: number;
}

interface TrendData {
    date: string;
    count: number;
}

interface TopConsultant {
    id: string;
    name: string;
    value: number;
    rank: number;
}

interface ExpertiseData {
    name: string;
    count: number;
    percentage: number;
}

interface RecentActivity {
    id: string;
    timestamp: Date;
    type: string;
    activityType: string;
    userName: string;
    userAvatar?: string;
    details: string;
    status: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function ConsultationManagement() {
    const [consultantStats, setConsultantStats] = useState<ConsultantStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [requestStats, setRequestStats] = useState<ConsultationRequestStats>({
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
    });
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
        averageRating: 0,
        responseRate: 0,
        completionRate: 0,
        noShowRate: 0,
    });
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [topConsultants, setTopConsultants] = useState<TopConsultant[]>([]);
    const [expertiseData, setExpertiseData] = useState<ExpertiseData[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7d');

    useEffect(() => {
        loadAllData();
    }, [period]);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadStats(),
            loadTrends(),
            loadTopConsultants(),
            loadExpertiseDistribution(),
            loadRecentActivities(),
        ]);
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const response = await api.get<any>('/consultation/admin/stats/overview');
            const data = response;

            setConsultantStats({
                total: data.consultants.total || 0,
                pending: data.consultants.pending || 0,
                approved: data.consultants.active || 0,
                rejected: data.consultants.suspended || 0,
            });

            setRequestStats({
                total: data.requests.total || 0,
                pending: data.requests.pending || 0,
                approved: data.requests.approved || 0,
                completed: data.requests.completed || 0,
            });

            setQualityMetrics({
                averageRating: data.quality.averageRating || 0,
                responseRate: data.quality.responseRate || 0,
                completionRate: data.quality.completionRate || 0,
                noShowRate: data.quality.noShowRate || 0,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadTrends = async () => {
        try {
            const response = await api.get<any>(`/consultation/admin/analytics/trends?period=${period}`);
            setTrendData(response.requestTrends || []);
        } catch (error) {
            console.error('Failed to load trends:', error);
        }
    };

    const loadTopConsultants = async () => {
        try {
            const response = await api.get<any>('/consultation/admin/analytics/top-consultants?metric=sessions&limit=10');
            setTopConsultants(response.consultants || []);
        } catch (error) {
            console.error('Failed to load top consultants:', error);
        }
    };

    const loadExpertiseDistribution = async () => {
        try {
            const response = await api.get<any>('/consultation/admin/analytics/expertise-distribution');
            setExpertiseData(response.expertise || []);
        } catch (error) {
            console.error('Failed to load expertise distribution:', error);
        }
    };

    const loadRecentActivities = async () => {
        try {
            const response = await api.get<any>('/consultation/admin/activities/recent?limit=10');
            setRecentActivities(response.activities || []);
        } catch (error) {
            console.error('Failed to load recent activities:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    };

    const getTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${days} hari yang lalu`;
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Management Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Kelola konsultan dan permintaan konsultasi</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Consultants</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultantStats.total}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600">{consultantStats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Consultants</p>
                            <p className="text-2xl font-bold text-green-600">{consultantStats.approved}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="text-2xl font-bold text-purple-600">{requestStats.total}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quality Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.averageRating.toFixed(1)} ⭐</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                        <p className="text-2xl font-bold text-green-600">{qualityMetrics.responseRate.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{qualityMetrics.completionRate.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">No-Show Rate</p>
                        <p className="text-2xl font-bold text-red-600">{qualityMetrics.noShowRate.toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Trends */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Trends</h2>
                        </div>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-3 py-1 border rounded-lg text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="90d">90 Days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9ca3af"
                            />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Requests"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Consultants */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Consultants</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topConsultants.slice(0, 5)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="value" fill="#8b5cf6" name="Sessions" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expertise Distribution & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expertise Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChartIcon className="w-5 h-5 text-pink-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expertise Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={expertiseData.slice(0, 6)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name} (${percentage}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {expertiseData.slice(0, 6).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h2>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {recentActivities.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No recent activities</p>
                        ) : (
                            recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <div className="flex-shrink-0">
                                        {activity.userAvatar ? (
                                            <img
                                                src={activity.userAvatar}
                                                alt={activity.userName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">
                                                    {activity.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.activityType}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {activity.details}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {getTimeAgo(activity.timestamp)}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            activity.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Consultant Management</h2>
                    <div className="space-y-3">
                        <a
                            href="/dashboard/consultation/consultants/pending"
                            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">Pending Approvals</span>
                                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm">
                                    {consultantStats.pending}
                                </span>
                            </div>
                        </a>
                        <a
                            href="/dashboard/consultation/consultants/active"
                            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">Active Consultants</span>
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                                    {consultantStats.approved}
                                </span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Request Management</h2>
                    <div className="space-y-3">
                        <a
                            href="/dashboard/consultation/requests/all"
                            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">All Requests</span>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                                    {requestStats.total}
                                </span>
                            </div>
                        </a>
                        <a
                            href="/dashboard/consultation/requests/pending"
                            className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">Pending Review</span>
                                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm">
                                    {requestStats.pending}
                                </span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

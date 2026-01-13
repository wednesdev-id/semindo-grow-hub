import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Search, TrendingUp, TrendingDown, Award, DollarSign, Users, Eye, Ban, CheckCircle, Star } from 'lucide-react';

interface ActiveConsultant {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    title: string;
    expertise: string[];
    yearsExperience: number;
    hourlyRate: number;
    totalSessions: number;
    averageRating: number;
    totalEarnings: number;
    isAcceptingNewClients: boolean;
    completionRate: number;
    noShowCount: number;
    recentSessions: number;
    joinedDate: Date;
}

interface PerformanceMetrics {
    consultant: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        profilePicture?: string;
        title: string;
        bio: string;
        expertise: string[];
        yearsExperience: number;
        hourlyRate: number;
        status: string;
        isAcceptingNewClients: boolean;
        joinedDate: Date;
    };
    metrics: {
        totalSessions: number;
        averageRating: number;
        totalEarnings: number;
        totalRequests: number;
        completedRequests: number;
        pendingRequests: number;
        cancelledRequests: number;
        completionRate: number;
        cancellationRate: number;
        totalRevenue: number;
        last30Days: {
            requests: number;
            completed: number;
            revenue: number;
        };
        ratingDistribution: Record<string, number>;
    };
    recentRequests: any[];
    recentReviews: any[];
}

export default function ActiveConsultants() {
    const [consultants, setConsultants] = useState<ActiveConsultant[]>([]);
    const [filteredConsultants, setFilteredConsultants] = useState<ActiveConsultant[]>([]);
    const [searchData, setSearchData] = useState('');
    const [sortBy, setSortBy] = useState('sessions');
    const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadConsultants();
    }, [sortBy]);

    useEffect(() => {
        filterConsultants();
    }, [searchData, consultants]);

    const loadConsultants = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>(`/consultation/admin/consultants/active?sort=${sortBy}&limit=50`);
            const data = response.consultants || [];
            setConsultants(data);
        } catch (error) {
            console.error('Failed to load consultants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterConsultants = () => {
        let filtered = [...consultants];

        if (searchData) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchData.toLowerCase()) ||
                c.email.toLowerCase().includes(searchData.toLowerCase()) ||
                c.title.toLowerCase().includes(searchData.toLowerCase()) ||
                c.expertise.some(e => e.toLowerCase().includes(searchData.toLowerCase()))
            );
        }

        setFilteredConsultants(filtered);
    };

    const viewPerformance = async (consultantId: string) => {
        try {
            setActionLoading(true);
            const response = await api.get<any>(`/consultation/admin/consultants/${consultantId}/performance`);
            setPerformanceData(response as PerformanceMetrics);
            setSelectedConsultant(consultantId);
            setShowPerformanceModal(true);
        } catch (error) {
            console.error('Failed to load performance data:', error);
            alert('Gagal memuat data performa konsultan');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleConsultantStatus = async (consultantId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} konsultan ini?`)) return;

        try {
            setActionLoading(true);
            await api.patch(`/consultation/admin/consultants/${consultantId}/status`, {
                status: currentStatus ? 'suspended' : 'approved',
                reason: currentStatus ? 'Suspended by admin' : 'Activated by admin'
            });

            // Reload consultants
            await loadConsultants();
            alert(`Konsultan berhasil ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`);
        } catch (error) {
            console.error('Failed to update consultant status:', error);
            alert('Gagal mengubah status konsultan');
        } finally {
            setActionLoading(false);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 4.0) return 'text-blue-600';
        if (rating >= 3.0) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: Date) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Consultants</h1>
                <p className="text-gray-600 dark:text-gray-400">Monitor performa dan kelola konsultan aktif</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Active</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultants.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {consultants.length > 0
                                    ? (consultants.reduce((sum, c) => sum + c.averageRating, 0) / consultants.length).toFixed(1)
                                    : '0.0'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {consultants.reduce((sum, c) => sum + c.totalSessions, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                Rp {(consultants.reduce((sum, c) => sum + c.totalEarnings, 0) / 1000000).toFixed(1)}M
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, title, or expertise..."
                            value={searchData}
                            onChange={(e) => setSearchData(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="sessions">Sort by Sessions</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="earnings">Sort by Earnings</option>
                    </select>
                </div>
            </div>

            {/* Consultants Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredConsultants.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No active consultants found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Consultant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Sessions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Earnings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Completion
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        30D Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredConsultants.map((consultant) => (
                                    <tr key={consultant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {consultant.profilePicture ? (
                                                    <img
                                                        src={consultant.profilePicture}
                                                        alt={consultant.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <span className="text-blue-600 dark:text-blue-300 font-medium">
                                                            {consultant.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {consultant.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {consultant.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {consultant.totalSessions}
                                                </span>
                                                {consultant.recentSessions > 0 && (
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-4 h-4 ${getRatingColor(consultant.averageRating)}`} fill="currentColor" />
                                                <span className={`font-medium ${getRatingColor(consultant.averageRating)}`}>
                                                    {consultant.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            Rp {(consultant.totalEarnings / 1000000).toFixed(1)}M
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span className={`font-medium ${consultant.completionRate >= 90 ? 'text-green-600' :
                                                    consultant.completionRate >= 75 ? 'text-blue-600' :
                                                        'text-yellow-600'
                                                    }`}>
                                                    {consultant.completionRate.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 dark:text-white">
                                            {consultant.recentSessions}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {consultant.isAcceptingNewClients ? (
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                                                    Not Accepting
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => viewPerformance(consultant.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                    title="View Performance"
                                                    disabled={actionLoading}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Performance Modal */}
            {showPerformanceModal && performanceData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full my-8">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
                            <button
                                onClick={() => setShowPerformanceModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {/* Profile Section */}
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                {performanceData.consultant.profilePicture ? (
                                    <img
                                        src={performanceData.consultant.profilePicture}
                                        alt={performanceData.consultant.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <span className="text-blue-600 dark:text-blue-300 text-xl font-medium">
                                            {performanceData.consultant.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{performanceData.consultant.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{performanceData.consultant.title}</p>
                                    <p className="text-sm text-gray-500 mt-1">{performanceData.consultant.email}</p>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Sessions</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{performanceData.metrics.totalSessions}</p>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Avg Rating</p>
                                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                        {performanceData.metrics.averageRating.toFixed(1)} ⭐
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm text-green-600 dark:text-green-400">Completion Rate</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                        {performanceData.metrics.completionRate.toFixed(0)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        Rp {(performanceData.metrics.totalRevenue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            </div>

                            {/* 30 Days Activity */}
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Last 30 Days</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Requests</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {performanceData.metrics.last30Days.requests}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {performanceData.metrics.last30Days.completed}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                                        <p className="text-xl font-bold text-purple-600">
                                            Rp {(performanceData.metrics.last30Days.revenue / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rating Distribution</h4>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map(rating => {
                                        const count = performanceData.metrics.ratingDistribution[rating] || 0;
                                        const total = Object.values(performanceData.metrics.ratingDistribution).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="text-sm w-12">{rating} ⭐</span>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-500 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm w-12 text-right text-gray-600 dark:text-gray-400">
                                                    {count} ({percentage}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Reviews */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Reviews</h4>
                                <div className="space-y-3">
                                    {performanceData.recentReviews.slice(0, 5).map((review, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900 dark:text-white">{review.client}</span>
                                                <span className="text-yellow-500">{review.rating} ⭐</span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(review.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                            <button
                                onClick={() => setShowPerformanceModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

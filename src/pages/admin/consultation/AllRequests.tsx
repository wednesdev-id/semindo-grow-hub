import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Search, Filter, Eye, Calendar, User, DollarSign, Clock, MessageSquare, Ban } from 'lucide-react';

interface ConsultationRequest {
    id: string;
    clientId: string;
    consultantId: string;
    topic: string;
    requestedDate: Date;
    requestedStartTime: Date;
    requestedEndTime: Date;
    durationMinutes: number;
    status: string;
    quotedPrice: number;
    createdAt: string;
    updatedAt: string;
    client: {
        fullName: string;
        email: string;
        profilePictureUrl?: string;
    };
    consultant: {
        id: string;
        user: {
            fullName: string;
        };
    };
}

export default function AllRequests() {
    const [requests, setRequests] = useState<ConsultationRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<ConsultationRequest[]>([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchData, setSearchData] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [searchData, filterStatus, selectedTab, requests]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>('/consultation/admin/requests');
            const data = response.requests || [];
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = [...requests];

        // Tab filter
        if (selectedTab !== 'all') {
            filtered = filtered.filter(r => {
                if (selectedTab === 'pending') return r.status === 'pending';
                if (selectedTab === 'approved') return r.status === 'approved';
                if (selectedTab === 'completed') return r.status === 'completed';
                if (selectedTab === 'cancelled') return r.status === 'cancelled';
                return true;
            });
        }

        // Search filter
        if (searchData) {
            filtered = filtered.filter(r =>
                r.topic.toLowerCase().includes(searchData.toLowerCase()) ||
                r.client.fullName.toLowerCase().includes(searchData.toLowerCase()) ||
                r.consultant.user.fullName.toLowerCase().includes(searchData.toLowerCase())
            );
        }

        // Status filter (additional)
        if (filterStatus && filterStatus !== 'all') {
            filtered = filtered.filter(r => r.status === filterStatus);
        }

        setFilteredRequests(filtered);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string }> = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
            approved: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
            completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
            cancelled: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
        };
        const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
                {status}
            </span>
        );
    };

    const viewDetails = (request: ConsultationRequest) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string | Date) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTabCounts = () => {
        return {
            all: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            completed: requests.filter(r => r.status === 'completed').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length,
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const tabCounts = getTabCounts();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Consultation Requests</h1>
                <p className="text-gray-600 dark:text-gray-400">Kelola semua permintaan konsultasi</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tabCounts.all}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{tabCounts.pending}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-blue-600">{tabCounts.approved}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{tabCounts.completed}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{tabCounts.cancelled}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4 px-6">
                        {[
                            { id: 'all', label: 'All Requests', count: tabCounts.all },
                            { id: 'pending', label: 'Pending', count: tabCounts.pending },
                            { id: 'approved', label: 'Active', count: tabCounts.approved },
                            { id: 'completed', label: 'Completed', count: tabCounts.completed },
                            { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${selectedTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by topic, client, or consultant..."
                                value={searchData}
                                onChange={(e) => setSearchData(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                {filteredRequests.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Consultant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Topic
                                    </th>
                                    <th className="px-6py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Price
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
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {request.client.profilePictureUrl ? (
                                                    <img
                                                        src={request.client.profilePictureUrl}
                                                        alt={request.client.fullName}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">
                                                            {request.client.fullName.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {request.client.fullName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {request.consultant.user.fullName}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900 dark:text-white">
                                            {request.topic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(request.requestedDate)}<br />
                                            {formatTime(request.requestedStartTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {request.durationMinutes} min
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            Rp {request.quotedPrice.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => viewDetails(request)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        Rp {selectedRequest.quotedPrice.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            {/* Participants */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Client</p>
                                    <div className="flex items-center gap-3">
                                        {selectedRequest.client.profilePictureUrl ? (
                                            <img
                                                src={selectedRequest.client.profilePictureUrl}
                                                alt={selectedRequest.client.fullName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <span className="text-blue-600 dark:text-blue-300 font-medium">
                                                    {selectedRequest.client.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.client.fullName}</p>
                                            <p className="text-sm text-gray-500">{selectedRequest.client.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Consultant</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                            <span className="text-purple-600 dark:text-purple-300 font-medium">
                                                {selectedRequest.consultant.user.fullName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.consultant.user.fullName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Topic & Schedule */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Topic</p>
                                    <p className="text-gray-900 dark:text-white">{selectedRequest.topic}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="text-gray-900 dark:text-white">{formatDate(selectedRequest.requestedDate)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Time</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <p className="text-gray-900 dark:text-white">
                                                {formatTime(selectedRequest.requestedStartTime)} - {formatTime(selectedRequest.requestedEndTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-900 dark:text-white">{selectedRequest.durationMinutes} minutes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRequest.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRequest.updatedAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowDetailModal(false)}
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

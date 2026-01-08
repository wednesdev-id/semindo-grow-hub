import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Search, Filter, CheckCircle, XCircle, Eye, FileText, Calendar, Award, DollarSign } from 'lucide-react';

interface PendingConsultant {
    id: string;
    user: {
        fullName: string;
        email: string;
        phone?: string;
        profilePictureUrl?: string;
    };
    title: string;
    bio: string;
    expertiseAreas: string[];
    yearsExperience: number;
    hourlyRate: number;
    certifications?: string;
    education?: string;
    createdAt: string;
}

export default function PendingApprovals() {
    const [consultants, setConsultants] = useState<PendingConsultant[]>([]);
    const [filteredConsultants, setFilteredConsultants] = useState<PendingConsultant[]>([]);
    const [searchData, setSearchData] = useState('');
    const [filterExpertise, setFilterExpertise] = useState('all');
    const [selectedConsultant, setSelectedConsultant] = useState<PendingConsultant | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingConsultants();
    }, []);

    useEffect(() => {
        filterConsultants();
    }, [searchData, filterExpertise, consultants]);

    const loadPendingConsultants = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>(`/consultation/consultants?status=pending`);

            // Filter only pending consultants
            const pending = response.consultants?.filter((c: any) => c.status === 'pending') || [];
            setConsultants(pending);
        } catch (error) {
            console.error('Failed to load pending consultants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterConsultants = () => {
        let filtered = [...consultants];

        // Search filter
        if (searchData) {
            filtered = filtered.filter(c =>
                c.user.fullName.toLowerCase().includes(searchData.toLowerCase()) ||
                c.user.email.toLowerCase().includes(searchData.toLowerCase()) ||
                c.title.toLowerCase().includes(searchData.toLowerCase())
            );
        }

        // Expertise filter
        if (filterExpertise && filterExpertise !== 'all') {
            filtered = filtered.filter(c =>
                c.expertiseAreas.some(e => e.toLowerCase() === filterExpertise.toLowerCase())
            );
        }

        setFilteredConsultants(filtered);
    };

    const handleApprove = async (consultantId: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menyetujui konsultan ini?')) return;

        try {
            setActionLoading(true);
            await api.patch(`/consultation/admin/consultants/${consultantId}/approve`, {});

            // Remove from list
            setConsultants(prev => prev.filter(c => c.id !== consultantId));
            setShowDetailModal(false);
            setSelectedConsultant(null);

            alert('Konsultan berhasil disetujui!');
        } catch (error) {
            console.error('Failed to approve consultant:', error);
            alert('Gagal menyetujui konsultan. Silakan coba lagi.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (consultantId: string) => {
        const reason = window.prompt('Alasan penolakan (opsional):');
        if (reason === null) return; // User cancelled

        try {
            setActionLoading(true);
            await api.patch(`/consultation/admin/consultants/${consultantId}/reject`, {
                reason: reason || 'Tidak memenuhi kriteria'
            });

            // Remove from list
            setConsultants(prev => prev.filter(c => c.id !== consultantId));
            setShowDetailModal(false);
            setSelectedConsultant(null);

            alert('Konsultan berhasil ditolak.');
        } catch (error) {
            console.error('Failed to reject consultant:', error);
            alert('Gagal menolak konsultan. Silakan coba lagi.');
        } finally {
            setActionLoading(false);
        }
    };

    const viewDetails = (consultant: PendingConsultant) => {
        setSelectedConsultant(consultant);
        setShowDetailModal(true);
    };

    const getExpertiseList = () => {
        const allExpertise = consultants.flatMap(c => c.expertiseAreas);
        return ['all', ...Array.from(new Set(allExpertise))];
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
                <p className="text-gray-600 dark:text-gray-400">Review dan verifikasi konsultan yang mendaftar</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{consultants.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Showing</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredConsultants.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Experience</p>
                    <p className="text-2xl font-bold text-green-600">
                        {consultants.length > 0
                            ? Math.round(consultants.reduce((sum, c) => sum + c.yearsExperience, 0) / consultants.length)
                            : 0} years
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or title..."
                            value={searchData}
                            onChange={(e) => setSearchData(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Expertise Filter */}
                    <div className="w-full md:w-64 relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterExpertise}
                            onChange={(e) => setFilterExpertise(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Expertise</option>
                            {getExpertiseList().filter(e => e !== 'all').map(expertise => (
                                <option key={expertise} value={expertise}>{expertise}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Consultants Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredConsultants.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada konsultan yang menunggu approval</p>
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
                                        Expertise
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Applied
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredConsultants.map((consultant) => (
                                    <tr key={consultant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {consultant.user.profilePictureUrl ? (
                                                    <img
                                                        src={consultant.user.profilePictureUrl}
                                                        alt={consultant.user.fullName}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <span className="text-blue-600 dark:text-blue-300 font-medium">
                                                            {consultant.user.fullName.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {consultant.user.fullName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {consultant.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {consultant.expertiseAreas.slice(0, 2).map((exp, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                                    >
                                                        {exp}
                                                    </span>
                                                ))}
                                                {consultant.expertiseAreas.length > 2 && (
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                                        +{consultant.expertiseAreas.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            {consultant.yearsExperience} years
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                            Rp {consultant.hourlyRate.toLocaleString('id-ID')}/jam
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(consultant.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => viewDetails(consultant)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(consultant.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                    title="Approve"
                                                    disabled={actionLoading}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(consultant.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Reject"
                                                    disabled={actionLoading}
                                                >
                                                    <XCircle className="w-5 h-5" />
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

            {/* Detail Modal */}
            {showDetailModal && selectedConsultant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Consultant Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-start gap-4">
                                {selectedConsultant.user.profilePictureUrl ? (
                                    <img
                                        src={selectedConsultant.user.profilePictureUrl}
                                        alt={selectedConsultant.user.fullName}
                                        className="w-20 h-20 rounded-full"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <span className="text-blue-600 dark:text-blue-300 text-2xl font-medium">
                                            {selectedConsultant.user.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedConsultant.user.fullName}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedConsultant.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{selectedConsultant.user.email}</p>
                                    {selectedConsultant.user.phone && (
                                        <p className="text-sm text-gray-500 dark:text-gray-500">{selectedConsultant.user.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedConsultant.yearsExperience} years</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Hourly Rate</p>
                                        <p className="font-medium text-gray-900 dark:text-white">Rp {selectedConsultant.hourlyRate.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Applied</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedConsultant.createdAt).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bio</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedConsultant.bio}</p>
                            </div>

                            {/* Expertise */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expertise Areas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedConsultant.expertiseAreas.map((exp, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                        >
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            {selectedConsultant.certifications && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Certifications</h4>
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedConsultant.certifications}</p>
                                </div>
                            )}

                            {/* Education */}
                            {selectedConsultant.education && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Education</h4>
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedConsultant.education}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className=" sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(selectedConsultant.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                <XCircle className="w-5 h-5" />
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedConsultant.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                <CheckCircle className="w-5 h-5" />
                                {actionLoading ? 'Processing...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

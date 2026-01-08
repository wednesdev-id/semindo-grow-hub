import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

interface ConsultantProfile {
    id: string;
    userId: string;
    title: string;
    tagline: string;
    expertiseAreas: string[];
    yearsExperience: number;
    status: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
}

export default function PendingConsultants() {
    const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadPendingConsultants();
    }, []);

    const loadPendingConsultants = async () => {
        try {
            // In real implementation, create admin endpoint
            // For now using placeholder
            setConsultants([]);
        } catch (error) {
            console.error('Failed to load consultants:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveConsultant = async (id: string) => {
        try {
            await api.patch(`/consultation/admin/consultants/${id}/approve`, {});
            alert('Consultant approved successfully!');
            loadPendingConsultants();
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve consultant');
        }
    };

    const rejectConsultant = async (id: string) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            await api.patch(`/consultation/admin/consultants/${id}/reject`, { reason });
            alert('Consultant rejected');
            loadPendingConsultants();
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject consultant');
        }
    };

    const filteredConsultants = consultants.filter((c) =>
        c.user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
        c.user.email.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Pending Consultant Approvals</h1>
                <p className="text-gray-600">Review and approve consultant applications</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
            </div>

            {/* Consultants List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : filteredConsultants.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No pending consultants</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredConsultants.map((consultant) => (
                        <div key={consultant.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{consultant.user.fullName}</h3>
                                    <p className="text-gray-600">{consultant.title}</p>
                                    <p className="text-sm text-gray-500">{consultant.user.email}</p>

                                    <div className="mt-3">
                                        <p className="text-sm text-gray-700">{consultant.tagline}</p>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {consultant.expertiseAreas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-3 text-sm text-gray-600">
                                        Experience: {consultant.yearsExperience} years
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => approveConsultant(consultant.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => rejectConsultant(consultant.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

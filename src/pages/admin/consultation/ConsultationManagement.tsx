import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Users, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // In real implementation, create dedicated stats endpoint
            // For now, using placeholder data
            setConsultantStats({
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
            });
            setRequestStats({
                total: 0,
                pending: 0,
                approved: 0,
                completed: 0,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Consultation Management</h1>
                <p className="text-gray-600">Kelola konsultan dan permintaan konsultasi</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Consultants</p>
                            <p className="text-2xl font-bold">{consultantStats.total}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600">{consultantStats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Consultants</p>
                            <p className="text-2xl font-bold text-green-600">{consultantStats.approved}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold">{requestStats.total}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Consultation Requests Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Consultation Requests Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600">Pending Requests</p>
                        <p className="text-xl font-bold text-yellow-600">{requestStats.pending}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600">Approved Requests</p>
                        <p className="text-xl font-bold text-blue-600">{requestStats.approved}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600">Completed Sessions</p>
                        <p className="text-xl font-bold text-green-600">{requestStats.completed}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Consultant Management</h2>
                    <div className="space-y-3">
                        <a
                            href="/dashboard/consultation/consultants/pending"
                            className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Pending Approvals</span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                    {consultantStats.pending}
                                </span>
                            </div>
                        </a>
                        <a
                            href="/dashboard/consultation/consultants/active"
                            className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Active Consultants</span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {consultantStats.approved}
                                </span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Request Management</h2>
                    <div className="space-y-3">
                        <a
                            href="/dashboard/consultation/requests/all"
                            className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">All Requests</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {requestStats.total}
                                </span>
                            </div>
                        </a>
                        <a
                            href="/dashboard/consultation/requests/pending"
                            className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Pending Review</span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
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

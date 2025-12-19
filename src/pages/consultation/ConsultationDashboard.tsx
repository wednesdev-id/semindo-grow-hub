import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import type { ConsultationRequest } from '../../types/consultation';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Clock } from 'lucide-react';

export default function ConsultationDashboard() {
    const [requests, setRequests] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'client' | 'consultant'>('client');

    useEffect(() => {
        loadRequests();
    }, [activeTab]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getRequests(activeTab);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">My Consultations</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'client'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        As Client
                    </button>
                    <button
                        onClick={() => setActiveTab('consultant')}
                        className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'consultant'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        As Consultant
                    </button>
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No consultation requests yet</p>
                        {activeTab === 'client' && (
                            <Link
                                to="/consultation/consultants"
                                className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Find a Consultant
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{request.topic}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>

                                        {activeTab === 'client' && request.consultant && (
                                            <p className="text-gray-600 mb-2">
                                                With {request.consultant.user.fullName}
                                            </p>
                                        )}

                                        {activeTab === 'consultant' && request.client && (
                                            <p className="text-gray-600 mb-2">
                                                Client: {request.client.fullName}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(request.requestedDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {request.requestedStartTime} - {request.requestedEndTime}
                                            </div>
                                            <div>{request.durationMinutes} minutes</div>
                                        </div>

                                        {request.description && (
                                            <p className="mt-2 text-gray-700 text-sm">{request.description}</p>
                                        )}

                                        {request.meetingUrl && request.status === 'approved' && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                <p className="text-sm text-blue-900 mb-1 font-medium">Meeting Link:</p>
                                                <a
                                                    href={request.meetingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    {request.meetingUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex gap-2">
                                        <Link
                                            to={`/consultation/requests/${request.id}/chat`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Chat"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </Link>

                                        {activeTab === 'consultant' && request.status === 'pending' && (
                                            <Link
                                                to={`/consultation/requests/${request.id}/respond`}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Respond
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import type { ConsultationRequest } from '../../types/consultation';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Clock, FileText, Download, X } from 'lucide-react';
import PaymentModal from './payment/PaymentModal';

export default function ConsultationDashboard() {
    const [requests, setRequests] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'client' | 'consultant'>('client');
    const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<ConsultationRequest | null>(null);

    // File Modal State
    const [showFilesModal, setShowFilesModal] = useState(false);
    const [selectedFilesRequest, setSelectedFilesRequest] = useState<ConsultationRequest | null>(null);
    const [viewFiles, setViewFiles] = useState<any[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const openFilesModal = async (request: ConsultationRequest) => {
        setSelectedFilesRequest(request);
        setShowFilesModal(true);
        setLoadingFiles(true);
        try {
            const files = await consultationService.getFiles(request.id);
            setViewFiles(files);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

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

                                        {request.sessionNotes && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 mb-1">Session Notes:</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.sessionNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex gap-2 flex-col sm:flex-row">
                                        {activeTab === 'client' && request.status === 'approved' && !request.isPaid && (
                                            <button
                                                onClick={() => setSelectedPaymentRequest(request)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                            >
                                                Pay Now
                                            </button>
                                        )}

                                        <button
                                            onClick={() => openFilesModal(request)}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                                            title="View Files"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </button>

                                        <Link
                                            to={`/consultation/requests/${request.id}/chat`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                                            title="Chat"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </Link>

                                        {activeTab === 'consultant' && request.status === 'pending' && (
                                            <Link
                                                to="/consultation/requests"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Manage Request
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedPaymentRequest && (
                <PaymentModal
                    isOpen={!!selectedPaymentRequest}
                    onClose={() => setSelectedPaymentRequest(null)}
                    requestId={selectedPaymentRequest.id}
                    amount={selectedPaymentRequest.quotedPrice || 150000} // Default or fallback
                    onPaymentSuccess={loadRequests}
                />
            )}

            {/* Files Modal */}
            {showFilesModal && selectedFilesRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Session Files</h3>
                            <button onClick={() => setShowFilesModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-1">{selectedFilesRequest.topic}</h4>
                            <p className="text-sm text-gray-500">Shared resources and documents</p>
                        </div>

                        {loadingFiles ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading files...</p>
                            </div>
                        ) : viewFiles.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No files shared yet.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {viewFiles.map((file: any) => (
                                    <li key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{file.fileName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full flex-shrink-0"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

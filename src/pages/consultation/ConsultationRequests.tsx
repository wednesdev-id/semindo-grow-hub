import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
import { ConsultationRequest } from '@/types/consultation';
import { format } from 'date-fns';
import { Check, X, Video, MessageSquare, Clock, Calendar, FileText, Upload, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionFile {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
    uploader?: { fullName: string };
    fileSize?: number;
}

export default function ConsultationRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal state for Accept
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
    const [meetingUrl, setMeetingUrl] = useState('');

    // Modal state for Session Management (Notes & Files)
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [manageRequest, setManageRequest] = useState<ConsultationRequest | null>(null);
    const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');

    // Session Notes State
    const [sessionNotes, setSessionNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    // Session Files State
    const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getRequests('consultant');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptClick = (request: ConsultationRequest) => {
        setSelectedRequest(request);
        setMeetingUrl('');
        setShowAcceptModal(true);
    };

    const confirmAccept = async () => {
        if (!selectedRequest) return;

        try {
            setProcessingId(selectedRequest.id);
            await consultationService.acceptRequest(selectedRequest.id, {
                meetingUrl: meetingUrl
            });
            setShowAcceptModal(false);
            fetchRequests(); // Refresh list
            alert('Request accepted successfully!');
        } catch (error) {
            console.error('Failed to accept request:', error);
            alert('Failed to accept request.');
        } finally {
            setProcessingId(null);
            setSelectedRequest(null);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!confirm('Are you sure you want to reject this request?')) return;

        try {
            setProcessingId(requestId);
            await consultationService.rejectRequest(requestId, 'Consultant is unavailable');
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Failed to reject request.');
        } finally {
            setProcessingId(null);
        }
    };

    // --- Session Management Handlers ---

    const openSessionManager = async (request: ConsultationRequest) => {
        setManageRequest(request);
        setSessionNotes(request.sessionNotes || '');
        setShowSessionModal(true);
        setActiveTab('notes');
        loadFiles(request.id);
    };

    const loadFiles = async (requestId: string) => {
        try {
            setLoadingFiles(true);
            const files = await consultationService.getFiles(requestId);
            setSessionFiles(files);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!manageRequest) return;
        try {
            setSavingNotes(true);
            await consultationService.updateSessionNotes(manageRequest.id, sessionNotes);

            // Update local state to reflect changes
            setRequests(prev => prev.map(r => r.id === manageRequest.id ? { ...r, sessionNotes } : r));

            alert('Notes saved successfully!');
        } catch (error) {
            console.error('Failed to save notes:', error);
            alert('Failed to save notes.');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!manageRequest || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        try {
            setUploadingFile(true);
            await consultationService.uploadFile(manageRequest.id, file);
            alert('File uploaded successfully!');
            loadFiles(manageRequest.id); // Refresh file list
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await consultationService.deleteFile(fileId);
            setSessionFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Failed to delete file.');
        }
    };

    // -----------------------------------

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const upcomingRequests = requests.filter(r => r.status === 'approved');
    const pastRequests = requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status));

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Consultation Requests</h1>

            {/* Pending Requests */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 bg-yellow-50 p-2 rounded-md border-l-4 border-yellow-400 inline-block">
                    Pending Requests ({pendingRequests.length})
                </h2>
                {pendingRequests.length === 0 ? (
                    <p className="text-gray-500">No pending requests.</p>
                ) : (
                    <div className="grid gap-4">
                        {pendingRequests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                onAccept={() => handleAcceptClick(req)}
                                onReject={() => handleReject(req.id)}
                                processing={processingId === req.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Sessions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 bg-blue-50 p-2 rounded-md border-l-4 border-blue-400 inline-block">
                    Upcoming Sessions ({upcomingRequests.length})
                </h2>
                {upcomingRequests.length === 0 ? (
                    <p className="text-gray-500">No upcoming sessions.</p>
                ) : (
                    <div className="grid gap-4">
                        {upcomingRequests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                onManage={() => openSessionManager(req)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed/History */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 bg-gray-50 p-2 rounded-md border-l-4 border-gray-400 inline-block">
                    History ({pastRequests.length})
                </h2>
                {pastRequests.map(req => (
                    <RequestCard
                        key={req.id}
                        request={req}
                        onManage={req.status === 'completed' ? () => openSessionManager(req) : undefined}
                    />
                ))}
            </div>

            {/* Accept Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Accept Request</h3>
                        <p className="mb-4 text-sm text-gray-600">
                            Please provide a meeting link for the session (e.g. Google Meet, Zoom).
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Meeting URL</label>
                            <input
                                type="url"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAccept}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Confirm & Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Management Modal */}
            {showSessionModal && manageRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Session Management</h3>
                            <button onClick={() => setShowSessionModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 border-b">
                            <p className="font-medium text-lg">{manageRequest.topic}</p>
                            <p className="text-sm text-gray-500">Client: {manageRequest.client?.fullName}</p>
                        </div>

                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <FileText size={16} /> Session Notes
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'files' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Upload size={16} /> Files & Resources
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'notes' ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Write a summary of the session, action items, or key takeaways. These notes will be visible to the client.
                                    </p>
                                    <textarea
                                        value={sessionNotes}
                                        onChange={(e) => setSessionNotes(e.target.value)}
                                        className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Session summary..."
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={savingNotes}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                                        >
                                            {savingNotes ? 'Saving...' : 'Save Notes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Upload size={16} />
                                            {uploadingFile ? 'Uploading...' : 'Upload New File'}
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">PDF, Images, DOCX up to 10MB</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Uploaded Files</h4>
                                        {loadingFiles ? (
                                            <p className="text-center text-gray-500">Loading files...</p>
                                        ) : sessionFiles.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4">No files uploaded yet.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {sessionFiles.map(file => (
                                                    <li key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm truncate max-w-[200px]">{file.fileName}</p>
                                                                <p className="text-xs text-gray-500">{format(new Date(file.createdAt), 'dd MMM yyyy')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={`http://localhost:3000${file.fileUrl}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                                title="Download"
                                                            >
                                                                <Download size={18} />
                                                            </a>
                                                            <button
                                                                onClick={() => handleDeleteFile(file.id)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RequestCard({ request, onAccept, onReject, onManage, processing }: any) {
    const isPending = request.status === 'pending';

    return (
        <div className="bg-white border rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {request.status}
                    </span>
                    <span className="text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'dd MMM yyyy')}
                    </span>
                    {request.isPaid && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Paid</span>}
                </div>

                <h3 className="font-semibold text-lg">{request.topic}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-gray-400" />
                        {format(new Date(request.requestedDate), 'EEEE, dd MMMM yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        {format(new Date(request.requestedStartTime), 'HH:mm')} - {format(new Date(request.requestedEndTime), 'HH:mm')}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-medium">Client:</span> {request.client?.fullName || 'Unknown User'}
                    </div>
                </div>

                {request.meetingUrl && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700">
                            <Video size={18} />
                            <span className="font-medium">Meeting Link:</span>
                            <a href={request.meetingUrl} target="_blank" rel="noreferrer" className="underline truncate max-w-xs">
                                {request.meetingUrl}
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 min-w-[140px] justify-center">
                {isPending && (
                    <>
                        <button
                            onClick={onAccept}
                            disabled={processing}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Check size={16} /> Accept
                        </button>
                        <button
                            onClick={onReject}
                            disabled={processing}
                            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <X size={16} /> Reject
                        </button>
                    </>
                )}

                {(request.status === 'approved' || request.status === 'completed') && (
                    <>
                        <Link
                            to={`/consultation/requests/${request.id}/chat`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-center"
                        >
                            <MessageSquare size={16} /> Chat
                        </Link>
                        {onManage && (
                            <button
                                onClick={onManage}
                                className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
                            >
                                <FileText size={16} /> Manage Session
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

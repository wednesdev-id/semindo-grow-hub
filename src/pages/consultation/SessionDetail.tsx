import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowLeft, ExternalLink, Save, CheckCircle } from 'lucide-react';
import { consultationService } from '@/services/consultationService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ChatWidget from '@/components/consultation/ChatWidget';
import { MoMCreator } from '@/components/consultation/MoMCreator';
import { MoMEditor } from '@/components/consultation/MoMEditor';
import type { ConsultationRequest, ConsultationMinutes } from '@/types/consultation';

export default function SessionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [request, setRequest] = useState<ConsultationRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [meetingLink, setMeetingLink] = useState('');
    const [isEditingLink, setIsEditingLink] = useState(false);

    // Completion State
    const [completionNotes, setCompletionNotes] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    // MoM State
    const [minutes, setMinutes] = useState<ConsultationMinutes | null>(null);
    const [loadingMinutes, setLoadingMinutes] = useState(false);
    const [showMoMPrompt, setShowMoMPrompt] = useState(false); // Show prompt after completing

    useEffect(() => {
        if (id) {
            loadRequest();
        }
    }, [id]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getRequestDetails(id!);
            if (data) {
                setRequest(data);
                setMeetingLink(data.meetingUrl || '');

                // Load MoM if consultation is completed
                if (data.status === 'completed') {
                    loadMinutes();
                }
            }
        } catch (error) {
            console.error('Failed to load request:', error);
            toast({
                title: 'Error',
                description: 'Failed to load session details',
                variant: 'destructive',
            });
            navigate('/consultation/dashboard'); // Redirect if fail
        } finally {
            setLoading(false);
        }
    };

    const loadMinutes = async () => {
        try {
            setLoadingMinutes(true);
            const data = await consultationService.getMinutes(id!);
            if (data.data) {
                setMinutes(data.data);
            }
        } catch (error) {
            console.error('Failed to load minutes:', error);
            // MoM might not exist yet, which is fine
        } finally {
            setLoadingMinutes(false);
        }
    };

    const handleUpdateLink = async () => {
        try {
            await consultationService.updateMeetingLink(id!, {
                meetingUrl: meetingLink,
                meetingPlatform: 'zoom' // Default or detect
            });
            toast({
                title: 'Success',
                description: 'Meeting link updated successfully',
            });
            setIsEditingLink(false);
            loadRequest(); // Refresh
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update link',
                variant: 'destructive',
            });
        }
    };

    const handleCompleteSession = async () => {
        try {
            setIsCompleting(true);

            // Auto-complete dengan default notes
            await consultationService.completeSession(id!, {
                sessionNotes: 'Session completed. See Minutes of Meeting for details.'
            });
            toast({
                title: 'Session Completed',
                description: 'The session has been marked as completed.'
            });

            // Reload request data
            await loadRequest();

            // Show MoM prompt after completing
            setShowMoMPrompt(true);
        } catch (error) {
            console.error('Failed to complete session:', error);
            toast({
                title: 'Error',
                description: 'Failed to complete session',
                variant: 'destructive'
            });
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading session details...</div>;
    }

    if (!request) return null;

    // Check for both English and Indonesian role names
    const hasConsultantRole = user?.roles?.includes('consultant') || user?.roles?.includes('konsultan');

    // Simplified check: user is consultant if they have the consultant role
    const isConsultant = hasConsultantRole;

    const isClient = user?.id === request.clientId;

    // Helper to format time from ISO date (Reverted to Local Time per User Request)
    const formatTime = (timeValue: string | null | undefined) => {
        try {
            if (!timeValue) return '--:--';
            const date = new Date(timeValue);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '--:--';
        }
    };

    const isExpired = request ? new Date() > new Date(request.requestedEndTime) : false;
    const canComplete = isConsultant && request?.status === 'approved' && isExpired; // Only for approved, not completed

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{request.topic}</h1>
                        <p className="text-gray-500 mt-1">
                            With {isConsultant ? request.client?.fullName : request.consultant?.user?.fullName}
                        </p>
                    </div>
                    <Badge
                        variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'outline' : 'secondary'}
                        className={`text-sm px-3 py-1 capitalize ${request.status === 'approved' ? 'bg-green-500' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''
                            }`}
                    >
                        {request.status}
                    </Badge>
                </div>
            </div>

            {/* Main Grid - 50:50 layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Full width Action Card if Can Complete */}
                {canComplete && (
                    <div className="lg:col-span-2">
                        <Card className="border-green-500 bg-green-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                    Session Time Expired
                                </CardTitle>
                                <CardDescription>
                                    This consultation session has ended. Mark as complete to enable Minutes of Meeting creation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleCompleteSession}
                                        disabled={isCompleting}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isCompleting ? 'Completing...' : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Mark as Complete
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Left Column: Details & Meeting */}
                <div className="space-y-6">
                    {/* Consultation Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Consultation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Participant Info */}
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {isConsultant
                                        ? (request.client?.fullName?.[0] || 'C')
                                        : (request.consultant?.user?.fullName?.[0] || 'C')
                                    }
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{isConsultant ? 'Client' : 'Consultant'}</p>
                                    <p className="font-semibold">
                                        {isConsultant ? request.client?.fullName : request.consultant?.user?.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {isConsultant ? request.client?.email : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {request.description && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                                    <p className="text-gray-700">{request.description}</p>
                                </div>
                            )}

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="font-medium text-sm">
                                            {new Date(request.requestedDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Time</p>
                                        <p className="font-medium text-sm">
                                            {formatTime(request.requestedStartTime)} - {formatTime(request.requestedEndTime)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="font-medium text-sm">{request.durationMinutes} minutes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Badge variant={request.isPaid ? 'default' : 'outline'} className={`text-xs ${request.isPaid ? 'bg-green-500' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {request.isPaid ? '✓ Paid' : 'Unpaid'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Type if available */}
                            {request.type && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">Type:</span>
                                    <Badge variant="outline">{request.type.name}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meeting Link Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Video className="h-5 w-5 text-green-600" />
                                Video Conference
                            </CardTitle>
                            <CardDescription>
                                Join the session via the link below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Consultant Edit View */}
                            {isConsultant ? (
                                <div className="space-y-4">
                                    <label className="text-sm font-medium">Meeting Link (Zoom/Google Meet)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="https://zoom.us/j/..."
                                            disabled={!isEditingLink && !!request.meetingUrl}
                                        />
                                        {isEditingLink || !request.meetingUrl ? (
                                            <Button onClick={handleUpdateLink}>
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => setIsEditingLink(true)}>
                                                Edit Link
                                            </Button>
                                        )}
                                    </div>
                                    {request.meetingUrl && (
                                        <Button className="w-full mt-2" variant="default" asChild>
                                            <a href={request.meetingUrl} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Test Join Meeting
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                /* Client View */
                                <div className="space-y-4">
                                    {request.meetingUrl ? (
                                        <Button className="w-full py-6 text-lg" size="lg" asChild>
                                            <a href={request.meetingUrl} target="_blank" rel="noreferrer">
                                                <Video className="h-6 w-6 mr-2" />
                                                Join Meeting Now
                                            </a>
                                        </Button>
                                    ) : (
                                        <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                                            <p>Meeting link not yet available.</p>
                                            <p className="text-sm">Please wait for the consultant to update it.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Session Notes if completed */}
                    {request.status === 'completed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Session Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{request.sessionNotes || "No notes provided."}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Minutes of Meeting - Only for consultant and completed sessions */}
                    {request.status === 'completed' && isConsultant && (
                        <div className="mt-6">
                            {/* MoM Prompt Card - Shown right after completing */}
                            {showMoMPrompt && !minutes && (
                                <Card className="border-blue-500 bg-blue-50/50 mb-4">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-700">
                                            <CheckCircle className="h-5 w-5" />
                                            Buat Notulensi Konsultasi?
                                        </CardTitle>
                                        <CardDescription>
                                            Sesi telah selesai. Apakah Anda ingin membuat notulensi otomatis dengan AI dari rekaman audio?
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-sm text-gray-700 mb-3">
                                                <strong>📝 Fitur Notulensi AI:</strong>
                                            </p>
                                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                                <li>✓ Transkrip otomatis dari audio</li>
                                                <li>✓ Ringkasan konsultasi</li>
                                                <li>✓ Poin-poin kunci</li>
                                                <li>✓ Action items dengan prioritas</li>
                                                <li>✓ Rekomendasi untuk klien</li>
                                            </ul>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setShowMoMPrompt(false)}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                Nanti Saja
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setShowMoMPrompt(false);
                                                    // Scroll to MoM section
                                                    document.getElementById('mom-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            >
                                                Buat Notulensi Sekarang
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            Anda bisa membuat notulensi nanti di bagian bawah halaman ini
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div id="mom-section">
                                <h3 className="text-xl font-bold mb-4">Notulensi Konsultasi (MoM)</h3>

                                {!minutes ? (
                                    <MoMCreator
                                        requestId={request.id}
                                        onSuccess={() => loadMinutes()}
                                    />
                                ) : (
                                    <MoMEditor
                                        requestId={request.id}
                                        onPublish={() => {
                                            toast({ title: 'Notulensi berhasil dipublikasi' });
                                            loadMinutes();
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* View MoM for client (read-only, only if published) */}
                    {request.status === 'completed' && !isConsultant && minutes && minutes.status === 'published' && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-4">Notulensi Konsultasi</h3>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Konsultasi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {minutes.summary && (
                                        <div>
                                            <h4 className="font-medium mb-2">Ringkasan</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutes.summary}</p>
                                        </div>
                                    )}

                                    {minutes.keyPoints && minutes.keyPoints.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Poin Kunci</h4>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                {minutes.keyPoints.map((point, idx) => (
                                                    <li key={idx}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {minutes.actionItems && minutes.actionItems.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Action Items</h4>
                                            <div className="space-y-2">
                                                {minutes.actionItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                                        <Badge variant={
                                                            item.priority === 'high' ? 'destructive' :
                                                            item.priority === 'medium' ? 'default' :
                                                            'secondary'
                                                        }>
                                                            {item.priority}
                                                        </Badge>
                                                        <span className="text-gray-700">{item.task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {minutes.recommendations && (
                                        <div>
                                            <h4 className="font-medium mb-2">Rekomendasi</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{minutes.recommendations}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column: Chat - Full Height */}
                <div className="lg:sticky lg:top-6">
                    <ChatWidget requestId={id!} className="h-[calc(100vh-180px)] min-h-[500px] shadow-lg border-t-4 border-t-blue-500 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

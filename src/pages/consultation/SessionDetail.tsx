import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { consultationService } from '@/services/consultationService';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import ChatWidget from '@/components/consultation/ChatWidget';
import type { ConsultationRequest } from '@/types/consultation';

export default function SessionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [request, setRequest] = useState<ConsultationRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [meetingLink, setMeetingLink] = useState('');
    const [isEditingLink, setIsEditingLink] = useState(false);

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

    if (loading) {
        return <div className="p-8 text-center">Loading session details...</div>;
    }

    if (!request) return null;

    const isConsultant = user?.id === request.consultant.userId;
    const isClient = user?.id === request.clientId;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
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
                    <Badge variant={request.status === 'approved' ? 'default' : 'secondary'} className="text-sm px-3 py-1 capitalize">
                        {request.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Meeting */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Time & Date */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">
                                        {new Date(request.requestedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium">
                                        {new Date(request.requestedStartTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(request.requestedEndTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meeting Link Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                                <CardTitle>Session Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{request.sessionNotes || "No notes provided."}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Chat */}
                <div className="lg:col-span-1">
                    <ChatWidget requestId={id!} className="h-[600px] shadow-lg border-t-4 border-t-blue-500" />
                </div>
            </div>
        </div>
    );
}

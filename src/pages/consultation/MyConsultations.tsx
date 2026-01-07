import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
import type { ConsultationRequest } from '@/types/consultation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, ExternalLink, FileText, User, CheckCircle, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function MyConsultations() {
    const { user, hasRole } = useAuth();
    // Check if user has consultant role (handle array or string role, including Indonesian 'konsultan')
    // Check both 'roles' (array) and 'role' (string/legacy)
    const userRoles = (user as any)?.roles || [];
    const userRole = (user as any)?.role;

    // Check if user has consultant role (handle array or string role, including Indonesian 'konsultan')
    const isConsultant = hasRole('consultant') || hasRole('konsultan') ||
        userRole === 'consultant' || userRole === 'konsultan' ||
        (Array.isArray(userRoles) && (userRoles.includes('consultant') || userRoles.includes('konsultan')));

    console.log('[MyConsultations] Debug Role:', {
        user,
        userRoles,
        userRole,
        isConsultant,
        hasRoleConsultant: hasRole('consultant'),
        hasRoleKonsultan: hasRole('konsultan')
    });
    const viewRole = isConsultant ? 'consultant' : 'client';

    const [requests, setRequests] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadConsultations();
        }
    }, [viewRole, user]);

    const loadConsultations = async () => {
        try {
            setLoading(true);
            const response = await consultationService.getRequests(viewRole);
            // Extract the data array from response object
            const data = Array.isArray(response) ? response : (response as any).data || [];
            setRequests(data);
        } catch (error) {
            console.error('Failed to load consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeValue: string | Date) => {
        if (!timeValue) return '';
        const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getConsultantName = (request: ConsultationRequest) => {
        if (isConsultant) {
            return request.client?.fullName || 'Client';
        }
        return request.consultant?.user?.fullName || 'Consultant';
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Filter requests by status
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const upcomingRequests = requests.filter(r => {
        if (r.status !== 'approved') return false;
        const sessionDate = new Date(r.requestedDate);
        return sessionDate >= new Date();
    }).sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());

    // History includes completed, rejected, and cancelled
    const historyRequests = requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status))
        .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'upcoming';
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['upcoming', 'pending', 'history'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
                    <p className="text-gray-600 mt-1">Track and manage your consultation sessions</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="upcoming">
                            Upcoming ({upcomingRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            Pending ({pendingRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            History ({historyRequests.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Upcoming Sessions */}
                    <TabsContent value="upcoming" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Card key={i} className="animate-pulse">
                                        <CardContent className="p-6">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : upcomingRequests.length > 0 ? (
                            upcomingRequests.map(request => (
                                <UpcomingSessionCard key={request.id} request={request} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                                    <p className="text-gray-600 mb-4">You don't have any scheduled consultations</p>
                                    <Button asChild>
                                        <Link to="/consultation">Browse Consultants</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Pending Requests */}
                    <TabsContent value="pending" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <Card key={i} className="animate-pulse">
                                        <CardContent className="p-6">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : pendingRequests.length > 0 ? (
                            pendingRequests.map(request => (
                                <PendingRequestCard key={request.id} request={request} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                                    <p className="text-gray-600">All your requests have been processed</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Completed History */}
                    <TabsContent value="history" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Card key={i} className="animate-pulse">
                                        <CardContent className="p-6">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : historyRequests.length > 0 ? (
                            historyRequests.map(request => (
                                <HistorySessionCard key={request.id} request={request} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Consultation History</h3>
                                    <p className="text-gray-600">Your completed sessions will appear here</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );

    // Helper components
    function UpcomingSessionCard({ request }: { request: ConsultationRequest }) {
        const consultantName = getConsultantName(request);

        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
                        <span className="text-sm text-gray-500">
                            {formatDate(request.requestedDate)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Consultant Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={isConsultant ? request.client?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getInitials(consultantName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{consultantName}</p>
                            <p className="text-sm text-gray-600">{request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}</p>
                        </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-600">Topic:</span>
                            <p className="font-medium">{request.topic}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(request.requestedStartTime)} - {formatTime(request.requestedEndTime)}</span>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    {request.meetingUrl && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Meeting Link:</p>
                            <Button size="sm" className="w-full" asChild>
                                <a href={request.meetingUrl} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Meeting ({request.meetingPlatform || 'Video Call'})
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                </a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    function PendingRequestCard({ request }: { request: ConsultationRequest }) {
        const consultantName = getConsultantName(request);

        return (
            <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-100 text-yellow-700">Pending Approval</Badge>
                        <span className="text-sm text-gray-500">
                            {formatDate(request.requestedDate)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Consultant Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={isConsultant ? request.client?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                            <AvatarFallback className="bg-yellow-100 text-yellow-700">
                                {getInitials(consultantName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{consultantName}</p>
                            <p className="text-sm text-gray-600">{request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}</p>
                        </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-600">Topic:</span>
                            <p className="font-medium">{request.topic}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(request.requestedStartTime)} - {formatTime(request.requestedEndTime)}</span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                        ⏳ Waiting for consultant to accept your request
                    </div>
                </CardContent>
            </Card>
        );
    }

    function HistorySessionCard({ request }: { request: ConsultationRequest }) {
        const consultantName = getConsultantName(request);

        // Status-based styling
        const statusConfig = {
            completed: {
                borderColor: 'border-l-green-500',
                badgeClass: 'bg-green-100 text-green-700',
                avatarBg: 'bg-green-100 text-green-700',
                label: 'Completed',
                icon: <CheckCircle className="h-3 w-3 mr-1" />
            },
            rejected: {
                borderColor: 'border-l-red-500',
                badgeClass: 'bg-red-100 text-red-700',
                avatarBg: 'bg-red-100 text-red-700',
                label: 'Rejected',
                icon: null
            },
            cancelled: {
                borderColor: 'border-l-gray-400',
                badgeClass: 'bg-gray-100 text-gray-600',
                avatarBg: 'bg-gray-100 text-gray-600',
                label: 'Cancelled',
                icon: null
            }
        };

        const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.completed;

        return (
            <Card className={`border-l-4 ${config.borderColor}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Badge className={config.badgeClass}>
                            {config.icon}
                            {config.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                            {formatDate(request.requestedDate)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Consultant Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={isConsultant ? request.client?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                            <AvatarFallback className={config.avatarBg}>
                                {getInitials(consultantName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{consultantName}</p>
                            <p className="text-sm text-gray-600">{request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}</p>
                        </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-600">Topic:</span>
                            <p className="font-medium">{request.topic}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(request.requestedStartTime)} - {formatTime(request.requestedEndTime)}</span>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {request.status === 'rejected' && request.statusReason && (
                        <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-red-700 mb-1">Reason:</p>
                            <p className="text-sm text-red-600">{request.statusReason}</p>
                        </div>
                    )}

                    {/* Session Notes from Consultant (for completed) */}
                    {request.status === 'completed' && request.sessionNotes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Session Summary:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.sessionNotes}</p>
                        </div>
                    )}

                    {/* Leave Review Button (for completed sessions) */}
                    {request.status === 'completed' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                        >
                            <Link to={`/consultation/consultant/${request.consultantId}`}>
                                <Star className="h-4 w-4 mr-2" />
                                Leave a Review
                            </Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }
}

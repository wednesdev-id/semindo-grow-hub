
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, ExternalLink, FileText, CheckCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { ConsultationRequest } from '@/types/consultation';

// Helpers
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

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getConsultantName = (request: ConsultationRequest, isConsultant: boolean) => {
    if (isConsultant) {
        return request.client?.fullName || 'Client';
    }
    return request.consultant?.user?.fullName || 'Consultant';
};

interface BaseCardProps {
    request: ConsultationRequest;
    isConsultant: boolean;
}

export function UpcomingSessionCard({ request, isConsultant }: BaseCardProps) {
    const consultantName = getConsultantName(request, isConsultant);
    const navigate = useNavigate();

    return (
        <Card
            className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(`/consultation/requests/${request.id}`)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
                        {request.unreadCount && request.unreadCount > 0 && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm">
                                {request.unreadCount} New Msg
                            </Badge>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        {formatDate(request.requestedDate)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Consultant Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={isConsultant ? (request.client as any)?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(consultantName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{consultantName}</p>
                        <p className="text-sm text-gray-600">
                            {request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}
                        </p>
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
                            <a
                                href={request.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
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

export function PendingRequestCard({ request, isConsultant }: BaseCardProps) {
    const consultantName = getConsultantName(request, isConsultant);

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
                        <AvatarImage src={isConsultant ? (request.client as any)?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                        <AvatarFallback className="bg-yellow-100 text-yellow-700">
                            {getInitials(consultantName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{consultantName}</p>
                        <p className="text-sm text-gray-600">
                            {request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}
                        </p>
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

export function HistorySessionCard({ request, isConsultant }: BaseCardProps) {
    const consultantName = getConsultantName(request, isConsultant);
    const navigate = useNavigate();

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
        <Card
            className={`border-l-4 ${config.borderColor} cursor-pointer hover:shadow-md transition-all`}
            onClick={() => navigate(`/consultation/requests/${request.id}`)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className={config.badgeClass}>
                            {config.icon}
                            {config.label}
                        </Badge>
                        {request.unreadCount && request.unreadCount > 0 && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm">
                                {request.unreadCount} New Msg
                            </Badge>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        {formatDate(request.requestedDate)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Consultant Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={isConsultant ? (request.client as any)?.profilePictureUrl : (request.consultant?.user as any)?.profilePictureUrl} />
                        <AvatarFallback className={config.avatarBg}>
                            {getInitials(consultantName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{consultantName}</p>
                        <p className="text-sm text-gray-600">
                            {request.consultant?.expertise?.map((e: any) => e.expertise?.name).filter(Boolean).join(', ') || request.consultant?.expertiseAreas?.join(', ') || 'Business Consultant'}
                        </p>
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
                        <Link
                            to={`/consultation/consultants/${request.consultantId}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Leave a Review
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

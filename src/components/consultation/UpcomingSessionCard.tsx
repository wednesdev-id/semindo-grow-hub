import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, ExternalLink, Edit, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ConsultationRequest } from '@/types/consultation';

interface UpcomingSessionCardProps {
    request: ConsultationRequest;
    onUpdateLink?: (requestId: string) => void;
    onAddNotes?: (requestId: string) => void;
    onComplete?: (requestId: string) => void;
}

import { useNavigate } from 'react-router-dom';

export function UpcomingSessionCard({ request, onUpdateLink, onAddNotes, onComplete }: UpcomingSessionCardProps) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/consultation/requests/${request.id}`);
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getTimeUntilSession = () => {
        const sessionDate = new Date(request.requestedDate);
        const now = new Date();
        const diffMs = sessionDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays <= 7) return `In ${diffDays} days`;
        return null;
    };

    const isSessionPassed = () => {
        const sessionDate = new Date(request.requestedDate);
        const endTime = new Date(request.requestedEndTime);
        const sessionEndDateTime = new Date(
            sessionDate.getFullYear(),
            sessionDate.getMonth(),
            sessionDate.getDate(),
            endTime.getHours(),
            endTime.getMinutes()
        );
        return new Date() > sessionEndDateTime;
    };

    const timeUntil = getTimeUntilSession();
    const isToday = timeUntil === 'Today';
    const canComplete = isSessionPassed();


    return (
        <Card
            className={`border-l-4 ${isToday ? 'border-l-green-500 bg-green-50/50' : 'border-l-blue-500'} cursor-pointer transition-all hover:shadow-md`}
            onClick={handleCardClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        {request.unreadCount && request.unreadCount > 0 && (
                            <Badge variant="destructive" className="animate-pulse shadow-sm">
                                {request.unreadCount} Unread
                            </Badge>
                        )}
                        <div className="text-sm font-semibold">Upcoming Session</div>
                        {timeUntil && (
                            <Badge variant={isToday ? "default" : "secondary"} className="text-xs">
                                {timeUntil}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={(request.client as any)?.profilePictureUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(request.client?.fullName || 'Client')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{request.client?.fullName || 'Client'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                            {(request.client as any)?.businessName || 'UMKM'}
                        </p>
                    </div>
                </div>

                {/* Session Details */}
                <div className="space-y-2">
                    <div>
                        <span className="text-xs text-muted-foreground">Topic:</span>
                        <p className="text-sm font-medium">{request.topic}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{formatDate(request.requestedDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                                {formatTime(request.requestedStartTime)} - {formatTime(request.requestedEndTime)}
                            </span>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    {request.meetingUrl && (
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <span className="text-xs text-muted-foreground block mb-1">Meeting Link:</span>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline break-all flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {request.meetingPlatform || 'Video Call'}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 flex-wrap">
                    {!canComplete && request.meetingUrl && (
                        <Button
                            size="sm"
                            className="flex-1"
                            asChild
                        >
                            <a href={request.meetingUrl} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                            </a>
                        </Button>
                    )}

                    {canComplete && onComplete && (
                        <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete(request.id);
                            }}
                        >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete Session
                        </Button>
                    )}

                    {!canComplete && onUpdateLink && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdateLink(request.id);
                            }}
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Update
                        </Button>
                    )}
                    {!canComplete && onAddNotes && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddNotes(request.id);
                            }}
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            Notes
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ConsultationRequest } from '@/types/consultation';

interface PendingRequestCardProps {
    request: ConsultationRequest;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
}

export function PendingRequestCard({ request, onAccept, onReject }: PendingRequestCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatTime = (timeValue: string | Date) => {
        // Handle PostgreSQL Time type (comes as DateTime with 1970-01-01 date)
        if (!timeValue) return '';

        const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;

        // Extract HH:mm from the time
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

    const isUrgent = () => {
        const requestDate = new Date(request.requestedDate);
        const today = new Date();
        const diffDays = Math.ceil((requestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 2; // Urgent if within 2 days
    };

    const getTimeSinceRequest = () => {
        const created = new Date(request.createdAt);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <Card className={`border-l-4 ${isUrgent() ? 'border-l-orange-500' : 'border-l-blue-500'} hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">New Request</div>
                        {isUrgent() && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {getTimeSinceRequest()}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={(request.client as any)?.profilePictureUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
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

                {/* Request Details */}
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

                    {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onAccept(request.id)}
                    >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(request.id)}
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        asChild
                    >
                        <Link to={`/consultation/requests`}>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

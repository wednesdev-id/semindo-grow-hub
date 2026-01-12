import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
import type { ConsultationRequest, ConsultantProfile } from '@/types/consultation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar,
    Clock,
    Video,
    ExternalLink,
    Search,
    ArrowRight,
    CalendarCheck,
    Users,
    Zap
} from 'lucide-react';

export default function ScheduleConsultationPage() {
    const { user } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState<ConsultationRequest[]>([]);
    const [recentConsultants, setRecentConsultants] = useState<ConsultantProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load client's requests
            const requests = await consultationService.getRequests('client');

            // Filter upcoming approved sessions
            const upcoming = requests
                .filter(r => r.status === 'approved')
                .filter(r => new Date(r.requestedDate) >= new Date())
                .sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime())
                .slice(0, 3);

            setUpcomingSessions(upcoming);

            // Get consultants from past sessions for quick booking
            const consultantMap = new Map<string, ConsultantProfile>();
            requests.forEach(r => {
                if (r.consultant && !consultantMap.has(r.consultant.id)) {
                    consultantMap.set(r.consultant.id, r.consultant);
                }
            });
            setRecentConsultants(Array.from(consultantMap.values()).slice(0, 3));

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Schedule Consultation</h1>
                            <p className="text-gray-600">Quickly book a session with your consultants</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Upcoming Sessions Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold">Your Upcoming Sessions</h2>
                            {upcomingSessions.length > 0 && (
                                <Badge variant="secondary">{upcomingSessions.length}</Badge>
                            )}
                        </div>
                        <Link
                            to="/consultation/history"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : upcomingSessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {upcomingSessions.map(session => (
                                <Card key={session.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={(session.consultant?.user as any)?.profilePictureUrl} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                                    {getInitials(session.consultant?.user?.fullName || 'C')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate text-sm">
                                                    {session.consultant?.user?.fullName || 'Consultant'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{session.topic}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(session.requestedDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatTime(session.requestedStartTime)}</span>
                                            </div>
                                        </div>

                                        {session.meetingUrl ? (
                                            <Button size="sm" className="w-full" asChild>
                                                <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                    <Video className="h-3 w-3 mr-1" />
                                                    Join Meeting
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="w-full" asChild>
                                                <Link to="/consultation/history">View Details</Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-medium text-gray-900 mb-1">No Upcoming Sessions</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    You don't have any scheduled consultations
                                </p>
                                <Button asChild>
                                    <Link to="/consultation/consultants">
                                        <Search className="h-4 w-4 mr-2" />
                                        Find a Consultant
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Quick Book Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Quick Book with Recent Consultants</h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : recentConsultants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recentConsultants.map(consultant => (
                                <Card key={consultant.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <Avatar className="h-16 w-16 mx-auto mb-3">
                                            <AvatarImage src={consultant.user?.profilePictureUrl} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                                                {getInitials(consultant.user?.fullName || 'C')}
                                            </AvatarFallback>
                                        </Avatar>

                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {consultant.user?.fullName || 'Consultant'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-1">{consultant.title}</p>

                                        {(consultant.expertise?.length > 0 || (consultant.expertiseAreas && consultant.expertiseAreas.length > 0)) && (
                                            <div className="flex flex-wrap justify-center gap-1 mb-4">
                                                {(consultant.expertise?.length > 0
                                                    ? consultant.expertise.map((e: any) => e.expertise.name)
                                                    : consultant.expertiseAreas
                                                ).slice(0, 2).map((area: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <Button className="w-full" asChild>
                                            <Link to={`/consultation/consultant/${consultant.id}`}>
                                                Book Session
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-medium text-gray-900 mb-1">No Recent Consultants</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Book your first consultation to see quick access here
                                </p>
                                <Button asChild>
                                    <Link to="/consultation/consultants">
                                        <Search className="h-4 w-4 mr-2" />
                                        Browse Consultants
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Browse All CTA */}
                <section>
                    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Looking for a new consultant?</h3>
                                <p className="text-blue-100">Browse our full directory of expert consultants</p>
                            </div>
                            <Button variant="secondary" size="lg" asChild>
                                <Link to="/consultation/consultants">
                                    <Search className="h-4 w-4 mr-2" />
                                    Browse All Consultants
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

            </div>
        </div>
    );
}

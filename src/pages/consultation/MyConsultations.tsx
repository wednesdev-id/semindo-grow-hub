import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { consultationService } from '@/services/consultationService';
import type { ConsultationRequest } from '@/types/consultation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { UpcomingSessionCard, PendingRequestCard, HistorySessionCard } from '@/components/consultation/ConsultationListCards';

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

    // Initial load & Role change effect
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
            console.log('[MyConsultations] Loaded Data:', data); // Debug loaded data
            setRequests(data);
        } catch (error) {
            console.error('Failed to load consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter requests by status
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const upcomingRequests = requests.filter(r => {
        if (r.status !== 'approved') return false;
        const sessionDate = new Date(r.requestedDate);
        return sessionDate >= new Date(); // Only future sessions
    }).sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());

    // History includes completed, rejected, cancelled, AND PAST approved sessions
    const historyRequests = requests.filter(r => {
        const isPastApproved = r.status === 'approved' && new Date(r.requestedDate) < new Date();
        return ['completed', 'rejected', 'cancelled'].includes(r.status) || isPastApproved;
    }).sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

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
                                <UpcomingSessionCard
                                    key={request.id}
                                    request={request}
                                    isConsultant={isConsultant}
                                />
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
                                <PendingRequestCard
                                    key={request.id}
                                    request={request}
                                    isConsultant={isConsultant}
                                />
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
                                <HistorySessionCard
                                    key={request.id}
                                    request={request}
                                    isConsultant={isConsultant}
                                />
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
}

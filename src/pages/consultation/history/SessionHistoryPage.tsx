import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, Video, FileText, Search, User } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { consultationService } from "@/services/consultationService";
import { ConsultationRequest } from "@/types/consultation";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to safely format time
const formatTime = (timeValue: string | null | undefined): string => {
    if (!timeValue) return '--:--';

    // If it's already in HH:MM or HH:MM:SS format
    if (typeof timeValue === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeValue)) {
        return timeValue.slice(0, 5);
    }

    // If it's an ISO date string
    if (typeof timeValue === 'string' && timeValue.includes('T')) {
        try {
            const date = new Date(timeValue);
            if (isValid(date)) {
                return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            }
        } catch {
            // Ignore parsing errors
        }
    }

    // Fallback: try to parse as Date
    try {
        const date = new Date(timeValue);
        if (isValid(date)) {
            return format(date, 'HH:mm');
        }
    } catch {
        // Ignore parsing errors
    }

    return '--:--';
};

// Helper function to safely format date
const formatDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) return '-';

    try {
        const date = new Date(dateValue);
        if (isValid(date) && date.getFullYear() > 1971) {
            return format(date, 'd MMM yyyy');
        }
    } catch {
        // Ignore parsing errors
    }

    return '-';
};

export default function SessionHistoryPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { hasRole } = useAuth();
    const isConsultant = hasRole('consultant') || hasRole('konsultan');
    const viewRole = isConsultant ? 'consultant' : 'client';

    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<ConsultationRequest[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<ConsultationRequest[]>([]);

    const [searchParams] = useSearchParams();

    // Filters - Initialize from URL if present
    const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || "all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchHistory();
    }, []);

    // Update filter if URL changes
    useEffect(() => {
        const status = searchParams.get('status');
        if (status && status !== statusFilter) {
            setStatusFilter(status);
        }
    }, [searchParams]);

    useEffect(() => {
        filterSessions();
    }, [sessions, statusFilter, searchQuery]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            // Fetch based on role
            const response = await consultationService.getRequests(viewRole);
            // Extract the data array from response object
            const sessionsData = Array.isArray(response) ? response : (response as any).data || [];
            setSessions(sessionsData);
        } catch (error) {
            toast({
                title: "Error fetching history",
                description: "Could not load session history.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filterSessions = () => {
        let filtered = [...sessions];

        if (statusFilter !== "all") {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.topic.toLowerCase().includes(q) ||
                (isConsultant
                    ? s.client?.fullName.toLowerCase().includes(q)
                    : s.consultant?.user.fullName.toLowerCase().includes(q))
            );
        }

        setFilteredSessions(filtered);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Upcoming</Badge>;
            case 'completed': return <Badge variant="secondary">Completed</Badge>;
            case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            case 'cancelled': return <Badge variant="outline" className="text-gray-500">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
                    <p className="text-muted-foreground">Manage your past and upcoming consultations.</p>
                </div>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="approved" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
                        Completed
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                        Rejected
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                        All
                    </TabsTrigger>
                </TabsList>

                <Card>
                    <CardHeader>
                        <div className="flex gap-2 items-center">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by topic or consultant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg mb-2">No {statusFilter === 'all' ? '' : statusFilter} sessions found.</p>
                                <p className="text-sm">
                                    {statusFilter === 'approved' && "You don't have any upcoming consultations."}
                                    {statusFilter === 'pending' && "No pending consultation requests at the moment."}
                                    {statusFilter === 'completed' && "You haven't completed any consultations yet."}
                                    {statusFilter === 'rejected' && "No rejected requests."}
                                    {statusFilter === 'all' && "Start by scheduling a consultation!"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSessions.map((session) => (
                                    <div key={session.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4 items-start">
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold overflow-hidden">
                                                {isConsultant
                                                    ? (session.client?.profilePictureUrl ? <img src={session.client.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : (session.client?.fullName[0] || "C"))
                                                    : (session.consultant?.user.profilePictureUrl ? <img src={session.consultant.user.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : (session.consultant?.user.fullName[0] || "C"))
                                                }
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{session.topic}</h4>
                                                    {getStatusBadge(session.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <User className="w-3 h-3" />
                                                    {isConsultant
                                                        ? `Client: ${session.client?.fullName}`
                                                        : `dengan ${session.consultant?.user.fullName}`
                                                    }
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatDate(session.requestedDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatTime(session.requestedStartTime)} - {formatTime(session.requestedEndTime)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            {session.status === 'approved' && session.meetingUrl && (
                                                <Button variant="default" size="sm" onClick={() => window.open(session.meetingUrl, '_blank')}>
                                                    <Video className="w-4 h-4 mr-2" /> Join Meeting
                                                </Button>
                                            )}

                                            <Button variant="outline" size="sm" onClick={() => navigate(`/consultation/session/${session.id}`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}

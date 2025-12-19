import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, Video, FileText, Search, User } from "lucide-react";
import { format } from "date-fns";
import { consultationService } from "@/services/consultationService";
import { ConsultationRequest } from "@/types/consultation";

export default function SessionHistoryPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<ConsultationRequest[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<ConsultationRequest[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        filterSessions();
    }, [sessions, statusFilter, searchQuery]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            // Fetch as client by default (backend handles role logic if needed, or we might need a role switcher)
            // Assuming 'client' role for now as this is "Riwayat Konsultasi Saya"
            const data = await consultationService.getRequests();
            setSessions(data);
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
                s.consultant?.user.fullName.toLowerCase().includes(q)
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
        <div className="min-h-screen bg-gray-50/50">
            <Navigation />

            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
                        <p className="text-muted-foreground">Manage your past and upcoming consultations.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex gap-2 items-center flex-1">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by topic or consultant..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-sm"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Upcoming</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No sessions found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSessions.map((session) => (
                                    <div key={session.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-4 items-start">
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                {session.consultant?.user.fullName[0] || "C"}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{session.topic}</h4>
                                                    {getStatusBadge(session.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <User className="w-3 h-3" /> with {session.consultant?.user.fullName}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {format(new Date(session.requestedDate), "d MMM yyyy")}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {session.requestedStartTime.slice(0, 5)} - {session.requestedEndTime.slice(0, 5)}
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

                                            <Button variant="outline" size="sm" onClick={() => navigate(`/consultation/requests/${session.id}/chat`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

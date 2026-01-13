import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorEventService } from "@/services/mentorEventService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingEventsPage() {
    const [search, setSearch] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch available events
    const { data: eventsResponse, isLoading } = useQuery({
        queryKey: ["umkm-events", search],
        queryFn: () => mentorEventService.getEventsForUMKM({
            upcoming: true,
            // Simple client-side search or pass to API if supported
            // The API supports province/city, but simple search might need backend update 
            // For now we just fetch upcoming.
        }),
    });

    // Fetch my registrations to show status
    const { data: myRegistrationsResponse } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: () => mentorEventService.getMyRegistrations(),
    });

    const events = eventsResponse?.data || [];
    const myRegistrations = myRegistrationsResponse?.data || [];

    const getRegistrationStatus = (eventId: string) => {
        const reg = myRegistrations.find(r => r.eventId === eventId);
        return reg ? reg.status : null;
    };

    const rsvpMutation = useMutation({
        mutationFn: (eventId: string) => mentorEventService.attendEvent(eventId),
        onSuccess: () => {
            toast({
                title: "Berhasil Mendaftar",
                description: "Anda telah terdaftar di event ini.",
            });
            queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            queryClient.invalidateQueries({ queryKey: ["umkm-events"] });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal Mendaftar",
                description: error.response?.data?.error || "Terjadi kesalahan.",
                variant: "destructive",
            });
        }
    });

    const cancelMutation = useMutation({
        mutationFn: (eventId: string) => mentorEventService.cancelAttendance(eventId),
        onSuccess: () => {
            toast({
                title: "Pendaftaran Dibatalkan",
                description: "Anda telah membatalkan kehadiran.",
            });
            queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            queryClient.invalidateQueries({ queryKey: ["umkm-events"] });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal Membatalkan",
                description: "Terjadi kesalahan.",
                variant: "destructive",
            });
        }
    });

    const handleAction = (eventId: string, currentStatus: string | null) => {
        if (currentStatus) {
            if (confirm("Apakah Anda yakin ingin membatalkan kehadiran?")) {
                cancelMutation.mutate(eventId);
            }
        } else {
            rsvpMutation.mutate(eventId);
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cari Event Mentoring</h1>
                    <p className="text-muted-foreground mt-1">
                        Temukan workshop, pelatihan, dan gathering komunitas di sekitar Anda.
                    </p>
                </div>
                {/* Search Bar */}
                <div className="w-full md:w-72 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari event atau lokasi..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-lg">
                    <p className="text-muted-foreground">Tidak ada event yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const status = getRegistrationStatus(event.id);
                        const isFull = event._count.attendees >= event.maxAttendees;

                        return (
                            <Card key={event.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
                                <div className="relative h-48 bg-slate-100">
                                    {event.thumbnail ? (
                                        <img
                                            src={event.thumbnail}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                            <Calendar className="w-12 h-12" />
                                        </div>
                                    )}
                                    <Badge className="absolute top-2 right-2 shadow-sm" variant={event.type === 'workshop' ? 'default' : 'secondary'}>
                                        {event.type}
                                    </Badge>
                                </div>

                                <CardHeader>
                                    <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(event.startDate), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                                    </div>
                                    <CardTitle className="line-clamp-2 hover:underline cursor-pointer" onClick={() => navigate(`/umkm/events/${event.slug}`)}>
                                        {event.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {event.city}, {event.province}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {event.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {event._count.attendees} / {event.maxAttendees} Peserta
                                            </span>
                                        </div>
                                        {event.registrationEnd && (
                                            <div className="flex items-center gap-1 text-amber-600 text-xs">
                                                <Clock className="w-3 h-3" />
                                                Pendaftaran: {format(new Date(event.registrationEnd), 'dd MMM')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    {status ? (
                                        <Button
                                            variant={status === 'cancelled' ? 'outline' : 'secondary'}
                                            className="w-full"
                                            onClick={() => handleAction(event.id, status)}
                                            disabled={status === 'cancelled' || rsvpMutation.isPending || cancelMutation.isPending}
                                        >
                                            {status === 'registered' ? 'Terdaftar (Batalkan?)' :
                                                status === 'confirmed' ? 'Dikonfirmasi' :
                                                    status === 'cancelled' ? 'Dibatalkan' :
                                                        status === 'attended' ? 'Hadir' : status}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            disabled={isFull || rsvpMutation.isPending}
                                            onClick={() => handleAction(event.id, null)}
                                        >
                                            {isFull ? 'Kuota Penuh' : 'Daftar Sekarang'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

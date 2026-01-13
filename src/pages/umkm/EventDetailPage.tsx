import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorEventService } from "@/services/mentorEventService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowLeft, Building, User } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function EventDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: eventResponse, isLoading } = useQuery({
        queryKey: ["umkm-event", slug],
        queryFn: () => mentorEventService.getEvent(slug!),
        enabled: !!slug
    });

    const { data: myRegistrationsResponse } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: () => mentorEventService.getMyRegistrations(),
    });

    const event = eventResponse?.data;
    const myRegistrations = myRegistrationsResponse?.data || [];

    const registration = event ? myRegistrations.find(r => r.eventId === event.id) : null;
    const currentStatus = registration?.status || null;

    const rsvpMutation = useMutation({
        mutationFn: (eventId: string) => mentorEventService.attendEvent(eventId),
        onSuccess: () => {
            toast({
                title: "Berhasil Mendaftar",
                description: "Anda telah terdaftar di event ini.",
            });
            queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            queryClient.invalidateQueries({ queryKey: ["umkm-event", slug] });
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
            queryClient.invalidateQueries({ queryKey: ["umkm-event", slug] });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal Membatalkan",
                description: "Terjadi kesalahan.",
                variant: "destructive",
            });
        }
    });

    if (isLoading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Event tidak ditemukan</h2>
                <Button onClick={() => navigate('/umkm/events')} className="mt-4">Kembali ke Daftar Event</Button>
            </div>
        );
    }

    const isFull = event._count.attendees >= event.maxAttendees;

    return (
        <div className="container py-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate('/umkm/events')} className="mb-2 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Event
            </Button>

            <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden bg-slate-100">
                {event.thumbnail ? (
                    <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <Calendar className="w-16 h-16" />
                    </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                    <Badge variant={event.type === 'workshop' ? 'default' : 'secondary'} className="text-lg py-1 px-3">
                        {event.type}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">{event.title}</h1>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(event.startDate), 'EEEE, dd MMMM yyyy, HH:mm', { locale: idLocale })}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.city}, {event.province}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    <div className="prose max-w-none">
                        <h3 className="text-xl font-semibold mb-2">Tentang Event Ini</h3>
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                            {event.description}
                        </p>
                    </div>

                    {event.venue && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Lokasi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{event.venue}</p>
                                        <p className="text-muted-foreground">{event.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pendaftaran</CardTitle>
                            <CardDescription>Status keikutsertaan Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentStatus ? (
                                <div className="p-4 bg-slate-50 rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Status Anda:</p>
                                    <Badge variant={currentStatus === 'cancelled' ? 'destructive' : 'default'} className="text-base px-4 py-1">
                                        {currentStatus.toUpperCase()}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sisa Kuota:</span>
                                        <span className={isFull ? "text-red-500 font-medium" : "font-medium"}>
                                            {event.maxAttendees - event._count.attendees} kursi
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Batas Daftar:</span>
                                        <span>
                                            {event.registrationEnd
                                                ? format(new Date(event.registrationEnd), 'dd MMM yyyy', { locale: idLocale })
                                                : "Sampai hari H"
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {currentStatus ? (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => {
                                        if (currentStatus !== 'cancelled' && confirm("Batalkan kehadiran?")) {
                                            cancelMutation.mutate(event.id);
                                        }
                                    }}
                                    disabled={currentStatus === 'cancelled' || cancelMutation.isPending}
                                >
                                    {currentStatus === 'cancelled' ? 'Telah Dibatalkan' : 'Batalkan Kehadiran'}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={isFull || rsvpMutation.isPending}
                                    onClick={() => rsvpMutation.mutate(event.id)}
                                >
                                    {isFull ? 'Kuota Penuh' : 'Daftar Sekarang'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Mentor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{event.mentor.user.fullName}</p>
                                    <p className="text-xs text-muted-foreground">Penyelenggara Event</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

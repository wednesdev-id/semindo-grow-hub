import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mentorEventService, MentorEvent } from '@/services/mentorEventService';
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    Edit2,
    Trash2,
    Share2
} from 'lucide-react';
import { toast } from 'sonner';
import EventAttendeesTable from './EventAttendeesTable';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<MentorEvent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const response = await mentorEventService.getEvent(id!);
            if (response.success) {
                setEvent(response.data);
            }
        } catch (error) {
            console.error('Failed to load event:', error);
            toast.error('Gagal memuat detail event');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus event ini?')) return;
        try {
            await mentorEventService.deleteEvent(id!);
            toast.success('Event berhasil dihapus');
            navigate('/events');
        } catch (error) {
            toast.error('Gagal menghapus event');
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'secondary';
            default: return 'destructive';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Dipublikasi';
            case 'draft': return 'Draft';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!event) return null;

    const occupancyRate = event.maxAttendees > 0
        ? Math.min(100, ((event._count?.attendees || 0) / event.maxAttendees) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/events')}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Detail Event
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusBadgeVariant(event.status)}>
                                {getStatusLabel(event.status)}
                            </Badge>
                            <span className="text-muted-foreground text-sm">•</span>
                            <span className="text-muted-foreground text-sm capitalize">{event.type}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link tersalin');
                        }}
                        title="Bagikan"
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/events/${id}/edit`)}
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Info Card */}
                    <Card className="overflow-hidden">
                        {event.thumbnail && (
                            <div className="h-48 w-full bg-slate-100 dark:bg-slate-800">
                                <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Tanggal & Waktu</p>
                                            <p className="text-sm text-muted-foreground">
                                                Mulai: {new Date(event.startDate).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Selesai: {new Date(event.endDate).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Batas Pendaftaran</p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.registrationEnd
                                                    ? new Date(event.registrationEnd).toLocaleString('id-ID')
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Lokasi</p>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                {event.venue}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.address}, {event.city}, {event.province}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Kapasitas</p>
                                            <p className="text-sm text-muted-foreground">
                                                Maksimal {event.maxAttendees} peserta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-2">Deskripsi</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendees Table */}
                    <EventAttendeesTable eventId={id!} />
                </div>

                {/* Right Column: Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistik Peserta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Terdaftar</span>
                                        <span className="font-medium">{event._count?.attendees || 0}</span>
                                    </div>
                                    <Progress value={occupancyRate} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-2 text-right">
                                        {Math.round(occupancyRate)}% dari kapasitas
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

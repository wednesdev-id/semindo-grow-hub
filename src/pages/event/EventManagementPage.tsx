import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, MentorEvent } from '@/services/mentorEventService';
import {
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    MoreVertical
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EventManagementPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState<MentorEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, draft
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadEvents();
    }, [user]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const mentorId = (user as any)?.mentorProfile?.id;
            if (!mentorId) return;

            const response = await mentorEventService.getEvents({ mentorId });
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
            toast.error('Gagal memuat data event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

        try {
            const response = await mentorEventService.deleteEvent(id);
            if (response.success) {
                toast.success('Event berhasil dihapus');
                loadEvents();
            }
        } catch (error) {
            toast.error('Gagal menghapus event');
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        const now = new Date();
        const eventDate = new Date(event.startDate);

        if (filter === 'upcoming') return eventDate >= now && event.status !== 'draft';
        if (filter === 'past') return eventDate < now && event.status !== 'draft';
        if (filter === 'draft') return event.status === 'draft';

        return true;
    });

    return (
        <div className="container mx-auto max-w-7xl py-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kelola Event
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Daftar event yang Anda selenggarakan untuk UMKM.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/events/new')}
                    className="shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Event Baru
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari event..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'upcoming', label: 'Mendatang' },
                            { id: 'past', label: 'Selesai' },
                            { id: 'draft', label: 'Draft' },
                        ].map((f) => (
                            <Button
                                key={f.id}
                                variant={filter === f.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(f.id)}
                                className="whitespace-nowrap rounded-full"
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Events List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0 flex flex-col sm:flex-row">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    {event.thumbnail ? (
                                        <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant={
                                                        event.status === 'published' ? 'default' :
                                                            event.status === 'draft' ? 'secondary' :
                                                                'destructive'
                                                    } className="capitalize">
                                                        {getStatusLabel(event.status)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground capitalize border px-2 py-0.5 rounded-full">
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">
                                                    <Link to={`/events/${event.id}`}>
                                                        {event.title}
                                                    </Link>
                                                </h3>
                                            </div>

                                            {/* Action Menu (Mobile & Desktop) */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                                                        <Eye className="w-4 h-4 mr-2" /> Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/edit`)}>
                                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(event.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary-500" />
                                                {new Date(event.startDate).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary-500" />
                                                {event.city}, {event.province}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-primary-500" />
                                                {event._count?.attendees || 0} / {event.maxAttendees} Peserta
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/edit`)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                            <CalendarIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            Belum ada event
                        </h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-sm">
                            {filter === 'all'
                                ? 'Anda belum membuat event apapun. Mulai buat event sekarang untuk menjangkau UMKM.'
                                : 'Tidak ada event yang sesuai dengan filter ini'}
                        </p>
                        {filter === 'all' && (
                            <Button onClick={() => navigate('/events/new')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Buat Event Pertama
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'published': return 'Dipublikasi';
        case 'draft': return 'Draft';
        case 'cancelled': return 'Dibatalkan';
        case 'completed': return 'Selesai';
        default: return status;
    }
}

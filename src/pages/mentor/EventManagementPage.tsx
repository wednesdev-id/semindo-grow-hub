import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, MentorEvent } from '@/services/mentorEventService';
import {
    Calendar,
    MapPin,
    Users,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    MoreVertical,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
            if (response.success) { // api.delete returns generic response, check success
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Kelola Event
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Daftar event yang Anda selenggarakan
                    </p>
                </div>
                <button
                    onClick={() => navigate('/mentor/events/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Buat Event
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {[
                        { id: 'all', label: 'Semua' },
                        { id: 'upcoming', label: 'Mendatang' },
                        { id: 'past', label: 'Selesai' },
                        { id: 'draft', label: 'Draft' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id
                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center group"
                        >
                            {/* Event Image/Icon */}
                            <div className="w-full sm:w-24 h-24 sm:h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {event.thumbnail ? (
                                    <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                                            <Link to={`/mentor/events/${event.id}`}>
                                                {event.title}
                                            </Link>
                                        </h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(event.startDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.city}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {event._count.attendees}/{event.maxAttendees} Peserta
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                        {getStatusLabel(event.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 pt-4 sm:pt-0 sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-4">
                                <button
                                    onClick={() => navigate(`/mentor/events/${event.id}`)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Detail
                                </button>
                                <button
                                    onClick={() => navigate(`/mentor/events/${event.id}/edit`)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Tidak ada event ditemukan
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {filter === 'all'
                                ? 'Mulai buat event pertama Anda sekarang'
                                : 'Tidak ada event yang sesuai dengan filter ini'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/mentor/events/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Event Baru
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        default: return 'bg-gray-100 text-gray-800';
    }
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

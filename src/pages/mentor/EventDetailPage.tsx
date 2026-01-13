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
            navigate('/mentor/events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus event ini?')) return;
        try {
            await mentorEventService.deleteEvent(id!);
            toast.success('Event berhasil dihapus');
            navigate('/mentor/events');
        } catch (error) {
            toast.error('Gagal menghapus event');
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

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/mentor/events')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Detail Event
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {event.status === 'published' ? 'Dipublikasi' : event.status}
                            </span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-500 text-sm capitalize">{event.type}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link tersalin');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Bagikan"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <Link
                        to={`/mentor/events/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        {event.thumbnail && (
                            <div className="h-48 w-full bg-gray-100">
                                <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {event.title}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Tanggal & Waktu</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Mulai: {new Date(event.startDate).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Selesai: {new Date(event.endDate).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Batas Pendaftaran</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                            <p className="font-medium text-gray-900 dark:text-white">Lokasi</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {event.venue}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {event.address}, {event.city}, {event.province}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Kapasitas</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Maksimal {event.maxAttendees} peserta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deskripsi</h3>
                                <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendees Table */}
                    <EventAttendeesTable eventId={id!} />
                </div>

                {/* Right Column: Stats (Optional Summary) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Statistik Peserta</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Terdaftar</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{event._count?.attendees || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, ((event._count?.attendees || 0) / event.maxAttendees) * 100)}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(((event._count?.attendees || 0) / event.maxAttendees) * 100)}% dari kapasitas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

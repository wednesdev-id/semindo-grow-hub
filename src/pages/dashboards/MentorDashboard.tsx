import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, MentorEvent } from '@/services/mentorEventService';
import {
    CalendarDays,
    Users,
    MapPin,
    Plus,
    BookOpen,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardStats {
    totalUMKM: number;
    totalEvents: number;
    upcomingEvents: number;
    totalCourses: number;
}

export default function MentorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalUMKM: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        totalCourses: 0,
    });
    const [upcomingEvents, setUpcomingEvents] = useState<MentorEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const mentorId = (user as any)?.mentorProfile?.id;
            if (!mentorId) return;

            // Load upcoming events
            const eventsResponse = await mentorEventService.getEvents({
                mentorId,
                upcoming: true,
                limit: 5,
            });

            if (eventsResponse.success) {
                setUpcomingEvents(eventsResponse.data);
                setStats(prev => ({
                    ...prev,
                    upcomingEvents: eventsResponse.data.length,
                }));
            }

            // Load total events count
            const allEventsResponse = await mentorEventService.getEvents({ mentorId });
            if (allEventsResponse.success) {
                setStats(prev => ({
                    ...prev,
                    totalEvents: allEventsResponse.meta?.total || allEventsResponse.data.length,
                }));
            }

            // Load UMKM data
            const umkmResponse = await mentorEventService.getUMKMByMentor(mentorId);
            if (umkmResponse.success) {
                setStats(prev => ({
                    ...prev,
                    totalUMKM: umkmResponse.data.length,
                }));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Mentor
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Selamat datang, {user?.fullName}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/events/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Buat Event Baru
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    label="UMKM Dampingan"
                    value={stats.totalUMKM}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    label="Total Event"
                    value={stats.totalEvents}
                    icon={CalendarDays}
                    color="green"
                />
                <StatsCard
                    label="Event Mendatang"
                    value={stats.upcomingEvents}
                    icon={Clock}
                    color="orange"
                />
                <StatsCard
                    label="Kursus Dibuat"
                    value={stats.totalCourses}
                    icon={BookOpen}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                    title="Kelola Event"
                    description="Buat dan kelola workshop/gathering untuk UMKM"
                    icon={CalendarDays}
                    to="/events"
                />
                <QuickActionCard
                    title="UMKM Dampingan"
                    description="Lihat peta dan data UMKM yang Anda dampingi"
                    icon={MapPin}
                    to="/mentor/my-umkm"
                />
                <QuickActionCard
                    title="Buat Kursus"
                    description="Upload materi pembelajaran untuk UMKM"
                    icon={BookOpen}
                    to="/mentor/courses"
                />
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Event Mendatang
                    </h2>
                    <Link
                        to="/events"
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        Lihat Semua →
                    </Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                            <EventListItem key={event.id} event={event} />
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada event mendatang</p>
                            <button
                                onClick={() => navigate('/events/new')}
                                className="mt-3 text-primary-600 hover:text-primary-700"
                            >
                                + Buat Event Pertama
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatsCard({ label, value, icon: Icon, color }: any) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ title, description, icon: Icon, to }: any) {
    return (
        <Link
            to={to}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}

function EventListItem({ event }: { event: MentorEvent }) {
    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const statusLabels: Record<string, string> = {
        draft: 'Draft',
        published: 'Dipublikasi',
        cancelled: 'Dibatalkan',
        completed: 'Selesai',
    };

    return (
        <Link
            to={`/events/${event.id}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
            <div className="flex-shrink-0 w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.city}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event._count.attendees}/{event.maxAttendees}
                    </span>
                </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[event.status]}`}>
                {statusLabels[event.status]}
            </span>
        </Link>
    );
}

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Event } from '../../types/community';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export const EventListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (type !== 'all') params.append('type', type);
                params.append('page', page.toString());
                params.append('limit', '9'); // Grid layout
                if (search) params.append('search', search);

                const response = await api.get<{ data: Event[], meta: any }>(`/community/events?${params.toString()}`);
                setEvents(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, search, type]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get('search') as string;
        setSearchParams({ search: q, page: '1', type });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event & Webinar</h1>
                    <p className="text-gray-500">
                        Temukan kegiatan menarik untuk mengembangkan bisnis Anda
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Cari event..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </form>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        value={type}
                        onChange={(e) => setSearchParams({ search, page: '1', type: e.target.value })}
                        className="border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="online">Online (Webinar)</option>
                        <option value="offline">Offline (Meetup)</option>
                    </select>
                </div>
            </div>

            {/* Event Grid */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <Link
                                key={event.id}
                                to={`/community/events/${event.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className="h-48 bg-gray-200 relative">
                                    {event.bannerUrl ? (
                                        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                            <Calendar className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase">
                                        {event.type}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-blue-600 font-medium mb-2">
                                        {new Date(event.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>{event._count?.registrations || 0} Terdaftar</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                                                {event.organizer.fullName.charAt(0)}
                                            </div>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                                {event.organizer.fullName}
                                            </span>
                                        </div>
                                        <span className="text-blue-600 text-sm font-medium group-hover:underline">
                                            Detail & Daftar
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full p-12 text-center text-gray-500">
                            Belum ada event yang tersedia saat ini.
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setSearchParams({ search, type, page: (page - 1).toString() })}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {page} of {meta.totalPages}
                    </span>
                    <button
                        disabled={page === meta.totalPages}
                        onClick={() => setSearchParams({ search, type, page: (page + 1).toString() })}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

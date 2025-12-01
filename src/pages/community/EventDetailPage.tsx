import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Share2, Clock, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Event } from '../../types/community';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { useAuth } from '../../contexts/AuthContext';

export const EventDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<{ data: Event }>(`/community/events/${id}`);
                setEvent(response.data);
                // Check if user is already registered (logic would depend on API response including user status or separate check)
                // For now, we'll assume the API returns a flag or we check the registrations list if included
                // Assuming `registrations` is included and we check if user ID is in it.
                const registrations = (response.data as any).registrations || [];
                if (user && registrations.some((r: any) => r.user.id === user.id)) {
                    setIsRegistered(true);
                }
            } catch (error) {
                console.error('Failed to fetch event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, user]);

    const handleRegister = async () => {
        if (!id || !user) return;

        setRegistering(true);
        try {
            await api.post(`/community/events/${id}/register`, {});
            setIsRegistered(true);
            alert('Berhasil mendaftar event!');
        } catch (error: any) {
            console.error('Failed to register:', error);
            alert(error.message || 'Gagal mendaftar event.');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!event) return <div className="text-center p-12">Event tidak ditemukan.</div>;

    const isFull = event.maxParticipants ? (event._count?.registrations || 0) >= event.maxParticipants : false;

    return (
        <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-gray-900">
                {event.bannerUrl ? (
                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-70" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 opacity-90" />
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {event.type}
                        </span>
                        {isFull && (
                            <span className={`bg-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                                Penuh
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
                    <div className="flex flex-wrap gap-6 text-sm md:text-base">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {new Date(event.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {new Date(event.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Event</h2>
                        <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                            {event.description}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Lokasi</h2>
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{event.location}</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {event.type === 'online' ? 'Link akan dikirimkan setelah pendaftaran' : 'Lihat di Google Maps'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Pendaftaran</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Kuota Peserta</span>
                                <span className="font-medium text-gray-900">
                                    {event.maxParticipants ? `${event.maxParticipants} Orang` : 'Tidak Terbatas'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Terdaftar</span>
                                <span className="font-medium text-gray-900">
                                    {event._count?.registrations || 0} Orang
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Biaya</span>
                                <span className="font-medium text-green-600">Gratis</span>
                            </div>
                        </div>

                        {isRegistered ? (
                            <div className="w-full py-3 bg-green-50 text-green-700 rounded-lg font-semibold flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Anda Terdaftar
                            </div>
                        ) : (
                            <button
                                onClick={handleRegister}
                                disabled={registering || isFull || !user}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center ${isFull
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {registering ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : null}
                                {isFull ? 'Kuota Penuh' : user ? 'Daftar Sekarang' : 'Login untuk Daftar'}
                            </button>
                        )}

                        {!user && (
                            <p className="text-xs text-center text-gray-500 mt-4">
                                Silakan <Link to="/login" className="text-blue-600 hover:underline">Login</Link> untuk mendaftar event ini.
                            </p>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Diselenggarakan oleh</h4>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                                    {event.organizer.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{event.organizer.fullName}</p>
                                    <p className="text-xs text-gray-500">{event.organizer.businessName || 'Organizer'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

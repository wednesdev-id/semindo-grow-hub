import { useState, useEffect } from 'react';
import { mentorEventService, MentorEventAttendee } from '@/services/mentorEventService';
import {
    Check,
    X,
    Search,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'sonner';

interface EventAttendeesTableProps {
    eventId: string;
}

export default function EventAttendeesTable({ eventId }: EventAttendeesTableProps) {
    const [attendees, setAttendees] = useState<MentorEventAttendee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadAttendees();
    }, [eventId]);

    const loadAttendees = async () => {
        try {
            setLoading(true);
            const response = await mentorEventService.getEventAttendees(eventId);
            if (response.success) {
                setAttendees(response.data);
            }
        } catch (error) {
            console.error('Failed to load attendees:', error);
            toast.error('Gagal memuat daftar peserta');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (attendeeId: string, status: 'confirmed' | 'cancelled' | 'attended') => {
        try {
            await mentorEventService.updateAttendance(eventId, attendeeId, status);
            toast.success(`Status peserta berhasil diperbarui menjadi ${getStatusLabel(status)}`);
            loadAttendees();
        } catch (error) {
            toast.error('Gagal memperbarui status peserta');
        }
    };

    const filteredAttendees = attendees.filter(a =>
        (a.umkmProfile?.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.umkmProfile?.businessName || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    Daftar Peserta ({attendees.length})
                </h3>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari peserta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Peserta</th>
                            <th className="px-6 py-3">Kontak</th>
                            <th className="px-6 py-3">Tanggal Daftar</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </td>
                            </tr>
                        ) : filteredAttendees.length > 0 ? (
                            filteredAttendees.map((attendee) => (
                                <tr key={attendee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-medium">
                                                {attendee.umkmProfile?.ownerName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {attendee.umkmProfile?.ownerName || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {attendee.umkmProfile?.businessName || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {/* Placeholders since umkmProfile currently missing email/phone */}
                                            <div className="text-xs text-gray-500">
                                                {attendee.umkmProfile?.city || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(attendee.registeredAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(attendee.status)}`}>
                                            {getStatusLabel(attendee.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {attendee.status === 'registered' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(attendee.id, 'confirmed')}
                                                        className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                                                        title="Setujui"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(attendee.id, 'cancelled')}
                                                        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                        title="Tolak"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {attendee.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(attendee.id, 'attended')}
                                                    className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                                                >
                                                    Tandai Hadir
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Belum ada peserta yang mendaftar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getStatusBadgeColor(status: string) {
    switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'registered': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'attended': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'rejected':
        case 'cancelled':
        case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'confirmed': return 'Dikonfirmasi';
        case 'registered': return 'Menunggu';
        case 'attended': return 'Hadir';
        case 'rejected': return 'Ditolak';
        case 'cancelled': return 'Batal';
        case 'no_show': return 'Tidak Hadir';
        default: return status;
    }
}

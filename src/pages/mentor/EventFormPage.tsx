import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, CreateEventDto } from '@/services/mentorEventService';
import { regionApi } from '@/services/umkmService';
import {
    Calendar,
    MapPin,
    Image as ImageIcon,
    Save,
    ArrowLeft,
    Loader2,
    Users,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function EventFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    // Form State
    const [formData, setFormData] = useState<CreateEventDto>({
        title: '',
        description: '',
        thumbnail: '',
        province: '',
        city: '',
        venue: '',
        address: '',
        startDate: '',
        endDate: '',
        registrationEnd: '',
        maxAttendees: 50,
        type: 'workshop',
        tags: [],
        latitude: 0,
        longitude: 0,
    });

    // Region Data
    const [provinces, setProvinces] = useState<{ province: string }[]>([]);
    const [cities, setCities] = useState<{ city: string }[]>([]);

    useEffect(() => {
        loadProvinces();
        if (isEditMode) {
            loadEvent();
        }
    }, [id]);

    useEffect(() => {
        if (formData.province) {
            loadCities(formData.province);
        }
    }, [formData.province]);

    const loadProvinces = async () => {
        try {
            const data = await regionApi.getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Failed to load provinces:', error);
        }
    };

    const loadCities = async (province: string) => {
        try {
            const data = await regionApi.getCities(province);
            setCities(data);
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    };

    const loadEvent = async () => {
        try {
            const response = await mentorEventService.getEvent(id!);
            if (response.success) {
                const event = response.data;
                setFormData({
                    title: event.title,
                    description: event.description,
                    thumbnail: event.thumbnail,
                    province: event.province,
                    city: event.city,
                    venue: event.venue,
                    address: event.address,
                    startDate: new Date(event.startDate).toISOString().slice(0, 16), // Format for datetime-local
                    endDate: new Date(event.endDate).toISOString().slice(0, 16),
                    registrationEnd: event.registrationEnd ? new Date(event.registrationEnd).toISOString().slice(0, 16) : '',
                    maxAttendees: event.maxAttendees,
                    type: event.type,
                    tags: event.tags,
                    latitude: event.latitude,
                    longitude: event.longitude,
                });
            }
        } catch (error) {
            toast.error('Gagal memuat data event');
            navigate('/mentor/events');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                registrationEnd: formData.registrationEnd ? new Date(formData.registrationEnd).toISOString() : undefined,
                maxAttendees: Number(formData.maxAttendees),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
            };

            if (isEditMode) {
                await mentorEventService.updateEvent(id!, payload);
                toast.success('Event berhasil diperbarui');
            } else {
                const mentorId = (user as any)?.mentorProfile?.id;
                if (!mentorId) throw new Error('Mentor profile not found');
                await mentorEventService.createEvent(payload);
                toast.success('Event berhasil dibuat');
            }

            navigate('/mentor/events');
        } catch (error) {
            console.error(error);
            toast.error(isEditMode ? 'Gagal memperbarui event' : 'Gagal membuat event');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/mentor/events')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Event' : 'Buat Event Baru'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Isi detail event workshop atau gathering Anda
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        Informasi Dasar
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Judul Event
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                placeholder="Contoh: Workshop Digital Marketing UMKM"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tipe Event
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="workshop">Workshop</option>
                                <option value="gathering">Gathering</option>
                                <option value="training">Training</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kapasitas (Peserta)
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="maxAttendees"
                                    required
                                    min="1"
                                    value={formData.maxAttendees}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Deskripsi
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                placeholder="Jelaskan detail acara, materi yang akan dibahas, dll."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                URL Thumbnail (Opsional)
                            </label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    name="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        Jadwal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mulai
                            </label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Selesai
                            </label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                required
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Batas Pendaftaran
                            </label>
                            <input
                                type="datetime-local"
                                name="registrationEnd"
                                value={formData.registrationEnd}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        Lokasi
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Provinsi
                            </label>
                            <select
                                name="province"
                                required
                                value={formData.province}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Pilih Provinsi</option>
                                {provinces.map((p) => (
                                    <option key={p.province} value={p.province}>
                                        {p.province}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kota/Kabupaten
                            </label>
                            <select
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!formData.province}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                <option value="">Pilih Kota</option>
                                {cities.map((c) => (
                                    <option key={c.city} value={c.city}>
                                        {c.city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Tempat (Venue)
                            </label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                placeholder="Contoh: Hotel Santika Premiere"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Alamat Lengkap
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                placeholder="Jl. Jenderal Sudirman No. 1"
                            />
                        </div>

                        {/* Simple Lat/Lng Inputs for now - can use map picker later */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Latitude
                            </label>
                            <input
                                type="number"
                                name="latitude"
                                step="any"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Longitude
                            </label>
                            <input
                                type="number"
                                name="longitude"
                                step="any"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/mentor/events')}
                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isEditMode ? 'Simpan Perubahan' : 'Buat Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}

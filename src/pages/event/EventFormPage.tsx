import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { mentorEventService, CreateEventDto } from '@/services/mentorEventService';
import { regionApi } from '@/services/umkmService';
import {
    Calendar as CalendarIcon,
    MapPin,
    Image as ImageIcon,
    Save,
    ArrowLeft,
    Loader2,
    Users,
    Clock,
    Layout
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import LocationPickerField from '@/components/maps/LocationPickerField';

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
                    thumbnail: event.thumbnail || '',
                    province: event.province,
                    city: event.city,
                    venue: event.venue || '',
                    address: event.address || '',
                    startDate: new Date(event.startDate).toISOString().slice(0, 16),
                    endDate: new Date(event.endDate).toISOString().slice(0, 16),
                    registrationEnd: event.registrationEnd ? new Date(event.registrationEnd).toISOString().slice(0, 16) : '',
                    maxAttendees: event.maxAttendees,
                    type: event.type,
                    tags: event.tags,
                    latitude: Number(event.latitude) || 0,
                    longitude: Number(event.longitude) || 0,
                });
            }
        } catch (error) {
            toast.error('Gagal memuat data event');
            navigate('/events');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: keyof CreateEventDto, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Basic Validation
            if (!formData.title || !formData.startDate || !formData.endDate || !formData.province || !formData.city) {
                toast.error('Mohon lengkapi data wajib (*)');
                setLoading(false);
                return;
            }

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

            navigate('/events');
        } catch (error) {
            console.error(error);
            toast.error(isEditMode ? 'Gagal memperbarui event' : 'Gagal membuat event');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl py-6 space-y-8 animate-fade-in">
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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {isEditMode ? 'Edit Event' : 'Buat Event Baru'}
                        </h1>
                        <p className="text-muted-foreground">
                            Isi formulir di bawah untuk {isEditMode ? 'memperbarui' : 'mempublikasikan'} event Anda.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/events')}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="min-w-[140px]"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isEditMode ? 'Simpan' : 'Buat Event'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Layout className="w-5 h-5 text-primary-500" />
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Detail utama mengenai event yang akan diselenggarakan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Event <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Contoh: Workshop Digital Marketing untuk UMKM"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="text-lg font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Tipe Event</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => handleSelectChange('type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="workshop">Workshop</SelectItem>
                                            <SelectItem value="gathering">Gathering</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxAttendees">Kapasitas (Orang) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="maxAttendees"
                                            name="maxAttendees"
                                            type="number"
                                            min="1"
                                            className="pl-9"
                                            value={formData.maxAttendees}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Lengkap <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Jelaskan detail acara, materi yang akan dibahas, dan benefit untuk peserta..."
                                    rows={8}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail">URL Thumbnail (Opsional)</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="thumbnail"
                                        name="thumbnail"
                                        placeholder="https://example.com/image.jpg"
                                        className="pl-9"
                                        value={formData.thumbnail}
                                        onChange={handleChange}
                                    />
                                </div>
                                {formData.thumbnail && (
                                    <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={formData.thumbnail}
                                            alt="Thumbnail preview"
                                            className="object-cover w-full h-full"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="w-5 h-5 text-primary-500" />
                                Jadwal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Mulai <span className="text-red-500">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Selesai <span className="text-red-500">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Batas Pendaftaran</Label>
                                <Input
                                    type="datetime-local"
                                    name="registrationEnd"
                                    value={formData.registrationEnd}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan jika pendaftaran dibuka hingga acara dimulai.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                Lokasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Provinsi <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(val) => handleSelectChange('province', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Provinsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((p) => (
                                            <SelectItem key={p.province} value={p.province}>
                                                {p.province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Kota/Kabupaten <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.city}
                                    onValueChange={(val) => handleSelectChange('city', val)}
                                    disabled={!formData.province}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kota" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((c) => (
                                            <SelectItem key={c.city} value={c.city}>
                                                {c.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Nama Tempat (Venue)</Label>
                                <Input
                                    name="venue"
                                    placeholder="Contoh: Hotel Mercure"
                                    value={formData.venue}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Alamat Lengkap</Label>
                                <Textarea
                                    name="address"
                                    placeholder="Jalan..."
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pt-2">
                                <LocationPickerField
                                    value={
                                        formData.latitude && formData.longitude
                                            ? { lat: formData.latitude, lng: formData.longitude, address: formData.address }
                                            : null
                                    }
                                    onChange={(loc) => {
                                        if (loc) {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: loc.lat,
                                                longitude: loc.lng,
                                                address: loc.address || prev.address
                                            }));
                                        } else {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: 0,
                                                longitude: 0,
                                                address: ''
                                            }));
                                        }
                                    }}
                                    province={formData.province}
                                    required
                                    label="Titik Lokasi Event"
                                    description="Pilih lokasi event pada peta agar peserta dapat menemukannya dengan mudah."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

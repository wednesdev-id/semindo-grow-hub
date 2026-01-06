import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { consultationService } from '@/services/consultationService';
import type { ConsultantProfile, AvailabilitySlot } from '@/types/consultation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
    Star, Clock, Calendar, ArrowLeft, Briefcase, CheckCircle,
    MapPin, Globe, Users, Award, MessageSquare, Video
} from 'lucide-react';

export default function ConsultantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadConsultant();
        }
    }, [id]);

    const loadConsultant = async () => {
        try {
            setLoading(true);
            const response = await consultationService.getConsultant(id!);
            // Extract data from response if needed
            const data = (response as any)?.data || response;
            setConsultant(data);
        } catch (error) {
            console.error('Failed to load consultant:', error);
            toast({
                title: 'Error',
                description: 'Failed to load consultant profile',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CN';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!consultant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Users className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Consultant Not Found</h2>
                <p className="text-gray-500 mb-4">The consultant you're looking for doesn't exist or has been removed.</p>
                <Button asChild>
                    <Link to="/consultation">Back to Browse</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
                <Link to="/consultation/consultants">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar Konsultan
                </Link>
            </Button>

            {/* Header Section */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                            <AvatarImage src={(consultant.user as any)?.profilePictureUrl} />
                            <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                                {getInitials((consultant.user as any)?.fullName || 'Consultant')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pt-4 md:pt-16">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {(consultant.user as any)?.fullName || 'Consultant'}
                                    </h1>
                                    <p className="text-gray-600">{consultant.title}</p>
                                    {consultant.tagline && (
                                        <p className="text-gray-500 text-sm mt-1">{consultant.tagline}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <div className="text-2xl font-bold text-blue-600">
                                        Rp {consultant.hourlyRate?.toLocaleString('id-ID')}/jam
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => setShowBookingModal(true)}
                                        disabled={!consultant.isAcceptingNewClients}
                                    >
                                        {consultant.isAcceptingNewClients ? (
                                            <>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Book Konsultasi
                                            </>
                                        ) : (
                                            'Tidak Tersedia'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Star className="h-8 w-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold">{consultant.averageRating?.toFixed(1) || '0.0'}</p>
                            <p className="text-sm text-gray-500">Rating</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold">{consultant.totalSessions || 0}</p>
                            <p className="text-sm text-gray-500">Sesi</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Award className="h-8 w-8 text-purple-500" />
                        <div>
                            <p className="text-2xl font-bold">{consultant.yearsExperience || 0}</p>
                            <p className="text-sm text-gray-500">Tahun Pengalaman</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle className={`h-8 w-8 ${consultant.isAcceptingNewClients ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-sm font-semibold">
                                {consultant.isAcceptingNewClients ? 'Tersedia' : 'Tidak Tersedia'}
                            </p>
                            <p className="text-sm text-gray-500">Status</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tentang</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 whitespace-pre-line">
                                {consultant.bio || 'Belum ada deskripsi.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Expertise */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bidang Keahlian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {consultant.expertiseAreas?.map((area, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                                        {area}
                                    </Badge>
                                )) || <p className="text-gray-500">Belum ada keahlian yang ditambahkan.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Industries */}
                    {consultant.industries && consultant.industries.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Industri</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {consultant.industries.map((industry, idx) => (
                                        <Badge key={idx} variant="outline" className="px-3 py-1">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {industry}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Languages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bahasa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {consultant.languages?.map((lang, idx) => (
                                    <Badge key={idx} variant="outline" className="px-2 py-1">
                                        <Globe className="h-3 w-3 mr-1" />
                                        {lang}
                                    </Badge>
                                )) || <p className="text-gray-500 text-sm">-</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Book CTA */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6 text-center">
                            <Video className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-2">Siap Konsultasi?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Jadwalkan sesi 1-on-1 dengan konsultan ini
                            </p>
                            <Button
                                className="w-full"
                                onClick={() => setShowBookingModal(true)}
                                disabled={!consultant.isAcceptingNewClients}
                            >
                                Book Sekarang
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    consultant={consultant}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </div>
    );
}

// Booking Modal Component
function BookingModal({ consultant, onClose }: { consultant: ConsultantProfile; onClose: () => void }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<{ date: string; startTime: string; endTime: string; status: string }[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [formData, setFormData] = useState({ topic: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate]);

    const fetchSlots = async (date: string) => {
        try {
            setLoadingSlots(true);
            const slots = await consultationService.getAvailableSlots(consultant.id, date, date);
            const mappedSlots = slots.map((slot: any) => ({
                date: slot.specificDate || date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: slot.isAvailable ? 'available' : 'booked'
            }));
            setAvailableSlots(mappedSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) {
            toast({ title: 'Error', description: 'Please select a time slot', variant: 'destructive' });
            return;
        }

        try {
            setSubmitting(true);
            const start = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);
            const end = new Date(`${selectedSlot.date}T${selectedSlot.endTime}`);
            const durationMinutes = (end.getTime() - start.getTime()) / 60000;

            await consultationService.createRequest({
                consultantId: consultant.id,
                requestedDate: selectedSlot.date,
                requestedStartTime: selectedSlot.startTime,
                requestedEndTime: selectedSlot.endTime,
                durationMinutes: durationMinutes,
                topic: formData.topic,
                description: formData.description,
            });

            toast({ title: 'Success', description: 'Booking request submitted successfully!' });
            navigate('/consultation/history');
        } catch (error) {
            console.error('Failed to submit booking:', error);
            toast({ title: 'Error', description: 'Failed to submit booking. Please try again.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Book Konsultasi</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                    <CardDescription>
                        Jadwalkan sesi dengan {(consultant.user as any)?.fullName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label>Pilih Tanggal</Label>
                            <Input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedSlot(null);
                                }}
                                className="mt-1"
                            />
                        </div>

                        {selectedDate && (
                            <div>
                                <Label>Pilih Waktu</Label>
                                {loadingSlots ? (
                                    <div className="text-center py-4 text-gray-500">Memuat slot tersedia...</div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-dashed mt-2">
                                        Tidak ada slot tersedia pada tanggal ini. Pilih tanggal lain.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {availableSlots.map((slot, idx) => (
                                            <Button
                                                key={idx}
                                                type="button"
                                                variant={selectedSlot === slot ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot.startTime} - {slot.endTime}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <Label>Topik Konsultasi</Label>
                            <Input
                                required
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="Apa yang ingin Anda diskusikan?"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Deskripsi (Opsional)</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="Jelaskan lebih detail kebutuhan konsultasi Anda..."
                                className="mt-1"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={submitting || !selectedSlot}>
                                {submitting ? 'Mengirim...' : 'Konfirmasi Booking'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

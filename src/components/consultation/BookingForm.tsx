import { useState, useEffect } from 'react';
import { consultationService } from '@/services/consultationService';
import type { ConsultantProfile, ConsultationPackage } from '@/types/consultation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Clock, Package as PackageIcon } from 'lucide-react';

interface BookingFormProps {
    consultant: ConsultantProfile;
    onSuccess: () => void;
    onCancel?: () => void;
}

export function BookingForm({ consultant, onSuccess, onCancel }: BookingFormProps) {
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<ConsultationPackage | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<{ date: string; startTime: string; endTime: string; status: string }[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        description: ''
    });

    // Get packages from consultant
    const packages = consultant.packages || [];

    useEffect(() => {
        if (selectedDate && selectedPackage) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate, selectedPackage]);

    const fetchSlots = async (date: string) => {
        try {
            setLoadingSlots(true);
            const slots = await consultationService.getAvailableSlots(consultant.id, date, date);

            // API returns 60-min slots. We need to merge them into availability windows
            // then regenerate based on selected package duration
            const durationMinutes = selectedPackage?.durationMinutes || 60;

            // Get available slots from API
            const apiSlots = (slots as any[]).filter((slot: any) => slot.status === 'available');

            if (apiSlots.length === 0) {
                setAvailableSlots([]);
                return;
            }

            // Merge consecutive 60-min slots into windows
            // Sort by startTime first
            apiSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

            const windows: { start: number; end: number }[] = [];

            for (const slot of apiSlots) {
                const startParts = slot.startTime.split(':');
                const endParts = slot.endTime.split(':');
                const slotStart = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                const slotEnd = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

                // Check if this slot extends the last window
                if (windows.length > 0 && windows[windows.length - 1].end === slotStart) {
                    windows[windows.length - 1].end = slotEnd;
                } else {
                    windows.push({ start: slotStart, end: slotEnd });
                }
            }

            // Generate sub-slots based on package duration
            const generatedSlots: { date: string; startTime: string; endTime: string; status: string }[] = [];

            for (const window of windows) {
                for (let time = window.start; time + durationMinutes <= window.end; time += durationMinutes) {
                    const startHour = Math.floor(time / 60);
                    const startMin = time % 60;
                    const endTimeMinutes = time + durationMinutes;
                    const endHour = Math.floor(endTimeMinutes / 60);
                    const endMin = endTimeMinutes % 60;

                    generatedSlots.push({
                        date: date,
                        startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
                        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
                        status: 'available'
                    });
                }
            }

            setAvailableSlots(generatedSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please login to book a consultation');
            return;
        }

        if (!selectedPackage) {
            alert('Please select a package');
            return;
        }

        if (!selectedSlot) {
            alert('Please select a time slot');
            return;
        }

        try {
            setSubmitting(true);

            await consultationService.createRequest({
                consultantId: consultant.id,
                packageId: selectedPackage.id,
                requestedDate: selectedSlot.date,
                requestedStartTime: selectedSlot.startTime,
                requestedEndTime: selectedSlot.endTime,
                durationMinutes: selectedPackage.durationMinutes,
                topic: formData.topic,
                description: formData.description,
            });

            onSuccess();
        } catch (error) {
            console.error('Failed to submit booking:', error);
            alert('Failed to submit booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} menit`;
        const hours = minutes / 60;
        return hours === 1 ? '1 jam' : `${hours} jam`;
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Package Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">Pilih Paket</label>
                {packages.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-dashed">
                        <PackageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Konsultan belum memiliki paket.</p>
                        <p className="text-sm">Silakan hubungi konsultan untuk informasi lebih lanjut.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {packages.map((pkg) => (
                            <button
                                key={pkg.id}
                                type="button"
                                onClick={() => {
                                    setSelectedPackage(pkg);
                                    setSelectedSlot(null);
                                    setAvailableSlots([]);
                                }}
                                className={`p-4 rounded-lg border text-left transition-all ${selectedPackage?.id === pkg.id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatDuration(pkg.durationMinutes)}</span>
                                        </div>
                                        {pkg.description && (
                                            <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-blue-600">
                                            {formatPrice(pkg.price)}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Date Selection */}
            {selectedPackage && (
                <div>
                    <label className="block text-sm font-medium mb-1">Pilih Tanggal</label>
                    <input
                        type="date"
                        required
                        min={today}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedSlot(null);
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
            )}

            {/* Slot Selection */}
            {selectedDate && selectedPackage && (
                <div>
                    <label className="block text-sm font-medium mb-2">Pilih Waktu</label>
                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-4 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading available slots...
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-dashed">
                            Tidak ada slot tersedia pada tanggal ini. Silakan pilih tanggal lain.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableSlots.map((slot, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`px-3 py-2 text-sm rounded-md border transition-all ${selectedSlot === slot
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    {slot.startTime} - {slot.endTime}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Topic & Description */}
            {selectedSlot && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1">Topik Konsultasi</label>
                        <input
                            type="text"
                            required
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            placeholder="Apa yang ingin Anda diskusikan?"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Jelaskan lebih detail kebutuhan konsultasi Anda..."
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Ringkasan Booking</h4>
                        <div className="text-sm space-y-1 text-gray-600">
                            <p><strong>Paket:</strong> {selectedPackage?.name}</p>
                            <p><strong>Durasi:</strong> {formatDuration(selectedPackage?.durationMinutes || 60)}</p>
                            <p><strong>Tanggal:</strong> {new Date(selectedSlot.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p><strong>Waktu:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                            <p className="text-lg font-semibold text-blue-600 pt-2">
                                Total: {formatPrice(selectedPackage?.price || 0)}
                            </p>
                        </div>
                    </div>
                </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Batal
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting || !selectedSlot || !selectedPackage || packages.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Konfirmasi Booking
                </button>
            </div>
        </form>
    );
}

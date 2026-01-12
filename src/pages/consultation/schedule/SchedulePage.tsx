import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { consultationService } from "@/services/consultationService";

import { BookingSlot } from "@/types/consultation";

export default function SchedulePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const consultantId = searchParams.get('consultantId');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const [consultant, setConsultant] = useState<any>(null);

    useEffect(() => {
        if (consultantId) {
            fetchConsultant();
            fetchSlots(selectedDate);
        }
    }, [consultantId, selectedDate]);

    const fetchConsultant = async () => {
        try {
            const data = await consultationService.getConsultantById(consultantId!);
            setConsultant(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSlots = async (date: Date) => {
        try {
            setLoading(true);
            const start = format(startOfWeek(date), 'yyyy-MM-dd');
            const end = format(endOfWeek(date), 'yyyy-MM-dd');

            const slots = await consultationService.getAvailableSlots(consultantId!, start, end);

            setAvailableSlots(slots);
        } catch (error) {
            toast({
                title: "Error fetching slots",
                description: "Could not load availability.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getSlotsForDate = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        return availableSlots.filter(s => s.date === dateString);
    };

    const handleBooking = () => {
        if (!selectedSlot || !consultant) return;

        // Navigate to booking confirmation/payment
        navigate(`/consultation/book?consultantId=${consultantId}&date=${selectedSlot.date}&time=${selectedSlot.startTime}`);
    };

    if (!consultantId) return <div>Missing consultant ID</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navigation />

            <div className="max-w-6xl mx-auto py-8 px-4">
                <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                </Button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar: Consultant Info */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {consultant?.user?.profilePictureUrl ? (
                                            <img src={consultant.user.profilePictureUrl} alt={consultant.user.fullName} />
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">{consultant?.user?.fullName?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{consultant?.user?.fullName}</CardTitle>
                                        <CardDescription>{consultant?.title}</CardDescription>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-medium">60 min</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Price</span>
                                        <span className="font-medium">
                                            {consultant?.packages?.length ? (
                                                <>Mulai Rp {Math.min(...consultant.packages.map((p: any) => p.price)).toLocaleString()}</>
                                            ) : consultant?.hourlyRate ? (
                                                <>Rp {consultant.hourlyRate.toLocaleString()}</>
                                            ) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Main: Calendar & Slots */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Select a Date & Time</CardTitle>
                                <CardDescription>Timezone: Asia/Jakarta (WIB)</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row gap-8">
                                {/* Calendar Picker */}
                                <div className="flex-1">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                                        className="rounded-md border shadow-sm"
                                    />
                                </div>

                                {/* Slots Grid */}
                                <div className="flex-1">
                                    <h3 className="font-medium mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-600" />
                                        Available Slots for {format(selectedDate, 'EEE, d MMM')}
                                    </h3>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {getSlotsForDate(selectedDate).length === 0 ? (
                                                <div className="col-span-2 text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                                    No slots available on this date
                                                </div>
                                            ) : (
                                                getSlotsForDate(selectedDate).map((slot, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={selectedSlot === slot ? "default" : "outline"}
                                                        className={`w-full justify-start ${selectedSlot === slot ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                        {slot.startTime}
                                                    </Button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Bar */}
                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                className="w-full md:w-auto px-8"
                                disabled={!selectedSlot}
                                onClick={handleBooking}
                            >
                                Continue to Booking
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

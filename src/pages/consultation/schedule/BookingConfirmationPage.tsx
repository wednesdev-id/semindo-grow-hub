import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { consultationService } from "@/services/consultationService";

export default function BookingConfirmationPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const consultantId = searchParams.get('consultantId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [consultant, setConsultant] = useState<any>(null);

    useEffect(() => {
        if (consultantId) {
            consultationService.getConsultantById(consultantId).then(setConsultant);
        }
    }, [consultantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consultantId || !date || !time) return;

        try {
            setLoading(true);
            // Calculate end time (assuming 60 mins for now)
            const startTime = time;
            const [hours, minutes] = time.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours + 1, minutes);
            const endTime = endDate.toTimeString().slice(0, 5);

            const request = await consultationService.createRequest({
                consultantId,
                requestedDate: date, // Pass string as expected by interface
                requestedStartTime: startTime,
                requestedEndTime: endTime,
                durationMinutes: 60,
                topic,
                description,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            toast({
                title: "Booking Submitted!",
                description: "Waiting for consultant approval.",
            });

            // Redirect to request details/chat
            navigate(`/consultation/requests/${request.id}/chat`);

        } catch (error: any) {
            toast({
                title: "Booking Failed",
                description: error.response?.data?.error || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!consultantId || !date || !time) return <div>Invalid booking parameters</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navigation />

            <div className="max-w-2xl mx-auto py-12 px-4">
                <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Confirm Booking</CardTitle>
                        <CardDescription>Complete your consultation request details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-purple-50 p-4 rounded-lg mb-6 flex items-start gap-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-purple-900">Consultation with {consultant?.user?.fullName}</p>
                                <div className="flex gap-4 text-sm text-purple-700">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time} (60 min)</span>
                                </div>
                            </div>
                        </div>

                        <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic *</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Business Strategy Review"
                                    required
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what you want to discuss..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Price</p>
                                    <p className="text-xl font-bold">Rp {consultant?.hourlyRate?.toLocaleString()}</p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" form="booking-form" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm & Book
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Video, Loader2 } from 'lucide-react';

interface QuickAcceptModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: { meetingUrl: string; meetingPlatform: string; notes?: string }) => Promise<void>;
    requestInfo?: {
        clientName: string;
        topic: string;
        date: string;
        time: string;
    };
}

export function QuickAcceptModal({ open, onClose, onConfirm, requestInfo }: QuickAcceptModalProps) {
    const [meetingPlatform, setMeetingPlatform] = useState('Zoom');
    const [meetingUrl, setMeetingUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!meetingUrl.trim()) {
            alert('Please enter a meeting link');
            return;
        }

        try {
            setSubmitting(true);
            await onConfirm({
                meetingUrl: meetingUrl.trim(),
                meetingPlatform,
                notes: notes.trim() || undefined
            });

            // Reset form
            setMeetingUrl('');
            setNotes('');
            setMeetingPlatform('Zoom');
        } catch (error) {
            console.error('Failed to accept request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        Accept Consultation Request
                    </DialogTitle>
                    <DialogDescription>
                        Set up the meeting details for this consultation session
                    </DialogDescription>
                </DialogHeader>

                {requestInfo && (
                    <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                        <div><span className="font-medium">Client:</span> {requestInfo.clientName}</div>
                        <div><span className="font-medium">Topic:</span> {requestInfo.topic}</div>
                        <div><span className="font-medium">Schedule:</span> {requestInfo.date}, {requestInfo.time}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Meeting Platform */}
                    <div className="space-y-2">
                        <Label>Meeting Platform</Label>
                        <RadioGroup value={meetingPlatform} onValueChange={setMeetingPlatform}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Zoom" id="zoom" />
                                <Label htmlFor="zoom" className="font-normal cursor-pointer">Zoom</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Google Meet" id="meet" />
                                <Label htmlFor="meet" className="font-normal cursor-pointer">Google Meet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Microsoft Teams" id="teams" />
                                <Label htmlFor="teams" className="font-normal cursor-pointer">Microsoft Teams</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Other" id="other" />
                                <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Meeting Link */}
                    <div className="space-y-2">
                        <Label htmlFor="meetingUrl">Meeting Link *</Label>
                        <Input
                            id="meetingUrl"
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            required
                            disabled={submitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            The client will receive this link to join the session
                        </p>
                    </div>

                    {/* Preparation Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Preparation Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any materials the client should prepare, topics to review, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            disabled={submitting}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Accepting...
                                </>
                            ) : (
                                'Confirm & Accept'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

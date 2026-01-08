import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CompleteSessionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: { sessionNotes: string; recommendations?: string }) => Promise<void>;
    sessionInfo?: {
        clientName: string;
        topic: string;
        date: string;
        time: string;
    };
}

export function CompleteSessionModal({ open, onClose, onConfirm, sessionInfo }: CompleteSessionModalProps) {
    const [sessionNotes, setSessionNotes] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionNotes.trim()) {
            alert('Please provide session notes');
            return;
        }

        try {
            setSubmitting(true);
            await onConfirm({
                sessionNotes: sessionNotes.trim(),
                recommendations: recommendations.trim() || undefined
            });

            // Reset form
            setSessionNotes('');
            setRecommendations('');
        } catch (error) {
            console.error('Failed to complete session:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Complete Session
                    </DialogTitle>
                    <DialogDescription>
                        Add session summary and recommendations before marking as completed
                    </DialogDescription>
                </DialogHeader>

                {sessionInfo && (
                    <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                        <div><span className="font-medium">Client:</span> {sessionInfo.clientName}</div>
                        <div><span className="font-medium">Topic:</span> {sessionInfo.topic}</div>
                        <div><span className="font-medium">Session:</span> {sessionInfo.date}, {sessionInfo.time}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Session Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="sessionNotes">Session Notes *</Label>
                        <Textarea
                            id="sessionNotes"
                            placeholder="Summary of discussion, topics covered, challenges discussed..."
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            rows={5}
                            disabled={submitting}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Provide a detailed summary of what was discussed during the session
                        </p>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                        <Label htmlFor="recommendations">Key Recommendations (Optional)</Label>
                        <Textarea
                            id="recommendations"
                            placeholder="1. Implement social media strategy&#10;2. Focus on customer retention&#10;3. Review pricing structure..."
                            value={recommendations}
                            onChange={(e) => setRecommendations(e.target.value)}
                            rows={4}
                            disabled={submitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            Key action items and recommendations for the client
                        </p>
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
                                    Completing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete Session
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

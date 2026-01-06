import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RejectRequestDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    clientName?: string;
}

export function RejectRequestDialog({ open, onClose, onConfirm, clientName }: RejectRequestDialogProps) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            setSubmitting(true);
            await onConfirm(reason.trim());
            setReason('');
        } catch (error) {
            console.error('Failed to reject request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reject Consultation Request</AlertDialogTitle>
                    <AlertDialogDescription>
                        {clientName ? (
                            <>Are you sure you want to reject the request from <strong>{clientName}</strong>?</>
                        ) : (
                            'Are you sure you want to reject this request?'
                        )}
                        <br />
                        Please provide a reason that will be shared with the client.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-4">
                    <Label htmlFor="reason">Reason for Rejection *</Label>
                    <Textarea
                        id="reason"
                        placeholder="e.g., Schedule conflict, Outside my expertise area, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        disabled={submitting}
                        required
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={submitting || !reason.trim()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            'Reject Request'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

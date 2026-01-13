import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { consultationService } from '../../../services/consultationService';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    amount: number;
    onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, requestId, amount, onPaymentSuccess }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        try {
            setLoading(true);
            await consultationService.payRequest(requestId, 'manual_transfer');
            toast({ title: 'Payment Successful', description: 'Your consultation is now confirmed!' });
            onPaymentSuccess();
            onClose();
        } catch (error: any) {
            toast({ title: 'Payment Failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        Please transfer the amount to the bank account below to confirm your session.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Amount to Pay</span>
                            <span className="font-bold">IDR {amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Bank</span>
                            <span className="font-bold">BCA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Account Number</span>
                            <span className="font-bold font-mono">123-456-7890</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Account Name</span>
                            <span className="font-bold">PT Semindo</span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                        *This is a manual transfer simulation. Clicking confirm will mark the request as paid immediately.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handlePayment} disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><CreditCard className="mr-2 h-4 w-4" /> I Have Transferred</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

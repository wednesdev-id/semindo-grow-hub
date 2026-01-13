import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '@/services/marketplaceService';

const COURIERS = [
    "JNE",
    "J&T Express",
    "SiCepat",
    "AnterAja",
    "GoSend",
    "GrabExpress",
    "Pos Indonesia",
    "TIKI",
    "Ninja Xpress",
    "ID Express",
    "Lainnya"
];

interface ShipmentDialogProps {
    orderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onShipmentSubmitted: () => void;
}

export function ShipmentDialog({ orderId, open, onOpenChange, onShipmentSubmitted }: ShipmentDialogProps) {
    const [courier, setCourier] = useState<string>('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !courier || !trackingNumber) {
            toast.error('Mohon lengkapi data pengiriman');
            return;
        }

        try {
            setSubmitting(true);
            await marketplaceService.updateShipment(orderId, trackingNumber, courier);
            toast.success('Resi pengiriman berhasil disimpan');
            onShipmentSubmitted();
            onOpenChange(false);
            // Reset form
            setCourier('');
            setTrackingNumber('');
        } catch (error) {
            console.error('Failed to update shipment:', error);
            toast.error('Gagal memperbarui pengiriman');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Konfirmasi Pengiriman
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan detail pengiriman untuk pesanan ini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="courier">Kurir Ekspedisi</Label>
                        <Select value={courier} onValueChange={setCourier} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kurir" />
                            </SelectTrigger>
                            <SelectContent>
                                {COURIERS.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tracking">Nomor Resi / Tracking Number</Label>
                        <Input
                            id="tracking"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Contoh: JP1234567890"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={submitting || !courier || !trackingNumber}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirim Pesanan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

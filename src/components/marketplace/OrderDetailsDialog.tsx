import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Package,
    Truck,
    CreditCard,
    MapPin,
    AlertCircle,
    XCircle,
    CheckCircle2,
    RefreshCcw,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { marketplaceService, Order } from '@/services/marketplaceService';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/core/auth/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

interface OrderDetailsDialogProps {
    orderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderUpdated?: () => void;
}

export function OrderDetailsDialog({ orderId, open, onOpenChange, onOrderUpdated }: OrderDetailsDialogProps) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelNote, setCancelNote] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (orderId && open) {
            fetchOrderDetails();
        } else {
            setOrder(null);
            setShowCancelConfirm(false);
            setCancelReason("");
            setCancelNote("");
        }
    }, [orderId, open]);

    // Poll for status updates if order is pending
    useEffect(() => {
        if (!open || !order || order.status !== 'pending' || order.paymentStatus === 'paid' || showCancelConfirm) return;

        const intervalId = setInterval(() => {
            onOrderUpdated?.();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [open, order?.status, order?.paymentStatus, onOrderUpdated, showCancelConfirm]);

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const data = await marketplaceService.getOrderDetails(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            toast.error('Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !cancelReason) return;

        try {
            setIsCancelling(true);
            const reasonText = cancelReason === 'Other' ? cancelNote : cancelReason;
            await marketplaceService.cancelOrder(order.id, reasonText);

            // Auto Restore to Cart
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    if (item.product) {
                        // Map backend product to frontend Product interface with robust checks
                        const p = item.product as any;

                        // Handle Image: Check if it's string or object
                        let imageUrl = '/api/placeholder/96/96';
                        if (p.images && p.images.length > 0) {
                            const firstImage = p.images[0];
                            if (typeof firstImage === 'string') {
                                imageUrl = firstImage;
                            } else if (typeof firstImage === 'object' && firstImage.url) {
                                imageUrl = firstImage.url;
                            }
                        } else if (p.image) {
                            imageUrl = p.image;
                        }

                        // Handle Name: Backend usually uses 'title'
                        const productName = p.title || p.name || 'Produk Tanpa Nama';

                        const productToRestore: any = {
                            ...p,
                            id: p.id,
                            name: productName,
                            title: productName,
                            slug: p.slug,
                            price: item.price, // Use the price at purchase time? Or current product price? Cart uses current usually, but for restore maybe purchase price? CartContext overwrites price if it fetches fresh? No, context stores what we give. Let's use product price from item.
                            image: imageUrl,
                            stock: p.stock // Ensure stock is passed so quantity checks work
                        };

                        for (let i = 0; i < item.quantity; i++) {
                            addToCart(productToRestore);
                        }
                    }
                });
            }

            toast.success('Pesanan berhasil dibatalkan dan produk dikembalikan ke keranjang');
            onOrderUpdated?.();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal membatalkan pesanan');
        } finally {
            setIsCancelling(false);
        }
    };

    const handlePayment = () => {
        if (!order) return;

        if (order.paymentLink) {
            window.open(order.paymentLink, '_blank');
        } else {
            toast.info('Silakan lakukan pembayaran manual sesuai instruksi pada saat checkout.', {
                description: 'Hubungi admin jika Anda membutuhkan bantuan.',
                action: {
                    label: 'Tutup',
                    onClick: () => { }
                }
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <CreditCard className="h-5 w-5 text-yellow-500" />;
            case 'processing': return <RefreshCcw className="h-5 w-5 text-blue-500" />;
            case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
            case 'delivered': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'Menunggu Pembayaran';
            case 'processing': return 'Sedang Diproses';
            case 'shipped': return 'Dalam Pengiriman';
            case 'delivered': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    const isBuyer = order && user && order.userId === user.id;

    // Logical check for cancellation availability
    const canCancel = order && ['pending', 'paid', 'processing'].includes(order.status.toLowerCase());

    if (!orderId && !open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                {loading ? (
                    <div className="h-[500px] flex items-center justify-center bg-white dark:bg-zinc-950">
                        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : order ? (
                    <>
                        <DialogHeader className="p-6 pb-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                        Detail Pesanan
                                        <Badge variant="outline" className="text-xs font-normal opacity-70">
                                            #{order.id.slice(0, 8)}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription className="mt-1">
                                        Dipesan pada {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="max-h-[70vh] bg-white dark:bg-zinc-950">
                            <div className="p-6 space-y-8">
                                {/* Status Overview - FORCE RENDER */}
                                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800">
                                        {getStatusIcon(order.status || 'unknown')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                            <p className="font-semibold text-lg">{getStatusLabel(order.status || 'unknown')}</p>
                                            <Badge className={['paid', 'success'].includes((order.paymentStatus || '').toLowerCase()) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'}>
                                                {['paid', 'success'].includes((order.paymentStatus || '').toLowerCase()) ? 'Pembayaran Berhasil' : 'Belum Dibayar'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {(!order.status || order.status === 'pending') ? 'Selesaikan pembayaran sebelum batas waktu.' :
                                                order.status === 'processing' ? 'Penjual sedang menyiapkan barang Anda.' :
                                                    order.status === 'shipped' ? 'Pesanan sedang dalam perjalanan.' :
                                                        order.status === 'delivered' ? 'Pesanan telah sampai di tujuan.' :
                                                            order.status === 'cancelled' ? 'Pesanan ini telah dibatalkan.' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Cancellation Reason Alert */}
                                {order.status === 'cancelled' && order.cancellationReason && (
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-bold text-red-700 dark:text-red-300">
                                                {order.cancelledBy === 'seller' ? 'Pesanan Dibatalkan Penjual' :
                                                    order.cancelledBy === 'buyer' ? 'Pesanan Dibatalkan Pembeli' :
                                                        'Pesanan Dibatalkan'}
                                            </p>
                                            <p className="text-sm text-red-600/90 dark:text-red-400/90 leading-relaxed">
                                                Alasan: <span className="font-medium italic">"{order.cancellationReason}"</span>
                                            </p>
                                            {order.cancelledAt && (
                                                <p className="text-xs text-red-500/70 dark:text-red-500/50">
                                                    Dibatalkan pada {format(new Date(order.cancelledAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Produk yang Dibeli
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors group">
                                                <div className="relative overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 w-20 h-20 shrink-0 shadow-sm">
                                                    <img
                                                        src={
                                                            typeof item.product?.images?.[0] === 'string'
                                                                ? item.product?.images?.[0]
                                                                : (item.product?.images?.[0] as any)?.url || '/api/placeholder/80/80'
                                                        }
                                                        alt={item.product?.name}
                                                        loading="lazy"
                                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className="font-bold text-base truncate">{item.product?.name}</p>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                        {item.quantity} × Rp {Number(item.price).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col justify-center">
                                                    <p className="font-bold whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                                                        Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="dark:bg-zinc-800" />

                                {/* Payment & Shipping Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Alamat Pengiriman
                                        </h3>
                                        <div className="text-sm bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl space-y-2 border border-zinc-100 dark:border-zinc-800">
                                            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{order.shippingAddress?.fullName || 'Nama Penerima'}</p>
                                            <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                <p>{order.shippingAddress?.address || 'Alamat tidak tersedia'}</p>
                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}</p>
                                            </div>
                                            <p className="text-zinc-900 dark:text-zinc-100 font-medium">{order.shippingAddress?.phone}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Truck className="h-5 w-5 text-primary" />
                                            Info Pengiriman
                                        </h3>
                                        <div className="text-sm bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl space-y-4 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                                <span className="text-zinc-500 dark:text-zinc-400">Kurir</span>
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{order.courier || 'Pilihan Kurir'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-zinc-500 dark:text-zinc-400">No. Resi</span>
                                                <span className="font-bold text-primary select-all">{order.trackingNumber || 'Belum tersedia'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="dark:bg-zinc-800" />

                                {/* Price Summary */}
                                <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl space-y-3 border border-primary/10 mb-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Total Harga ({order.items.length} Barang)</span>
                                        <span className="font-medium">Rp {(Number(order.totalAmount) - (Number(order.shippingCost || 0))).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Total Ongkos Kirim</span>
                                        <span className="font-medium">Rp {Number(order.shippingCost || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                    <Separator className="bg-primary/20" />
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Total Belanja</span>
                                        <span className="text-2xl font-black text-primary">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Cancellation Dialog UI / Buttons */}
                                {showCancelConfirm ? (
                                    <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <p className="font-bold text-lg">Konfirmasi Pembatalan</p>
                                        </div>
                                        <p className="text-sm text-red-600/80 dark:text-red-400/80 leading-relaxed">
                                            Mohon pilih alasan pembatalan Anda. {order.paymentStatus === 'paid' && "Dana akan dikembalikan secara otomatis ke saldo asal Anda."}
                                        </p>

                                        <div className="space-y-3">
                                            <Select value={cancelReason} onValueChange={setCancelReason}>
                                                <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border-red-200 dark:border-red-900/50">
                                                    <SelectValue placeholder="Pilih alasan pembatalan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Menemukan harga lebih murah">Menemukan harga lebih murah</SelectItem>
                                                    <SelectItem value="Ingin mengubah rincian pesanan">Ingin mengubah rincian pesanan</SelectItem>
                                                    <SelectItem value="Tidak ingin membeli lagi">Tidak ingin membeli lagi</SelectItem>
                                                    <SelectItem value="Stok produk kosong">Stok produk kosong</SelectItem>
                                                    <SelectItem value="Other">Alasan lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {cancelReason === 'Other' && (
                                                <Textarea
                                                    placeholder="Tuliskan alasan Anda..."
                                                    value={cancelNote}
                                                    onChange={(e) => setCancelNote(e.target.value)}
                                                    className="bg-white dark:bg-zinc-900 border-red-200 dark:border-red-900/50 min-h-[100px]"
                                                />
                                            )}

                                            <div className="flex gap-4 pt-2">
                                                <Button
                                                    variant="ghost"
                                                    className="flex-1 font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
                                                    onClick={() => setShowCancelConfirm(false)}
                                                    disabled={isCancelling}
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 font-bold shadow-lg shadow-red-500/20 py-6"
                                                    onClick={handleCancelOrder}
                                                    disabled={!cancelReason || (cancelReason === 'Other' && !cancelNote) || isCancelling}
                                                >
                                                    {isCancelling ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : null}
                                                    Konfirmasi Batalkan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-2">
                                        {/* Fallback: Always show Cancel if status is pending/paid/processing OR if status is missing */}
                                        {(canCancel || !order.status) && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold py-6 text-base"
                                                onClick={() => setShowCancelConfirm(true)}
                                            >
                                                Batalkan Pesanan
                                            </Button>
                                        )}
                                        {/* Payment Button */}
                                        {isBuyer && ['pending', 'unpaid'].includes((order.status || '').toLowerCase()) && ['unpaid', 'pending'].includes((order.paymentStatus || '').toLowerCase()) && (
                                            <div className="flex-1">
                                                <CountdownTimer expiryTime={order.expiryTime} onExpire={() => onOrderUpdated?.()} />
                                                <Button
                                                    className="w-full font-bold py-6 text-base group shadow-xl shadow-primary/20 mt-2"
                                                    onClick={handlePayment}
                                                    disabled={new Date(order.expiryTime || '') < new Date()}
                                                >
                                                    Bayar Sekarang
                                                    <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        )}
                                        {/* Contact Button */}
                                        {['processing', 'shipped'].includes((order.status || '').toLowerCase()) && (
                                            <Button variant="outline" className="flex-1 font-bold gap-2 py-6 text-base border-zinc-200 dark:border-zinc-800">
                                                <MessageCircle className="h-5 w-5 text-primary" />
                                                {isBuyer ? 'Hubungi Penjual' : 'Hubungi Pembeli'}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function CountdownTimer({ expiryTime, onExpire }: { expiryTime?: string, onExpire?: () => void }) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        if (!expiryTime) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(expiryTime) - +new Date();
            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            } else {
                return null;
            }
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (!tl) {
                clearInterval(timer);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTime]);

    if (!timeLeft) {
        return (
            <div className="w-full bg-red-100 text-red-800 text-center py-2 rounded-lg font-bold mb-2">
                Waktu Pembayaran Habis
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 py-2 rounded-lg font-medium text-sm mb-2 border border-amber-200 dark:border-amber-900/50">
            <span>Sisa Waktu Pembayaran:</span>
            <span className="font-bold font-mono text-base">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

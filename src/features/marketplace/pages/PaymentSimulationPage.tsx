import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { marketplaceService, Order } from '@/services/marketplaceService';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import {
    Loader2, CheckCircle2, AlertCircle, Copy, Smartphone,
    Clock, RefreshCw, AlertTriangle, HelpCircle, Lock, ChevronRight, Ban
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, cn } from '@/lib/utils';
import { parseISO, differenceInSeconds } from 'date-fns';

// --- Types & Constants ---
type PaymentState = 'pending' | 'verifying' | 'paid' | 'failed' | 'expired' | 'refunded';

const BANKS = [
    { id: 'bca_va', name: 'Bank BCA', icon: 'BCA', color: 'text-blue-600' },
    { id: 'mandiri_va', name: 'Bank Mandiri', icon: 'Mandiri', color: 'text-yellow-600' },
    { id: 'bni_va', name: 'Bank BNI', icon: 'BNI', color: 'text-orange-600' },
    { id: 'bri_va', name: 'Bank BRI', icon: 'BRI', color: 'text-blue-700' },
    { id: 'bsi_va', name: 'Bank Syariah Indonesia', icon: 'BSI', color: 'text-emerald-600' },
    // { id: 'qris', name: 'QRIS / E-Wallet', icon: 'QRIS', color: 'text-gray-800' }, 
]; // Focused on VA for now as per "Transfer harus sesuai nominal" warning which implies VA focus.

export default function PaymentSimulationPage() {
    const { paymentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Data State
    const [order, setOrder] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState(searchParams.get('method') || 'bca_va');

    // UI State
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false); // "Verifying" action state
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
    const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);

    // Derived Status
    const status: PaymentState = (order?.paymentStatus as PaymentState) || 'pending';
    const isPaid = status === 'paid';
    const isFailed = status === 'failed';
    const isExpired = status === 'expired' || (timeLeftSeconds !== null && timeLeftSeconds <= 0 && !isPaid);

    // --- Helpers ---
    const getPaymentDetails = (method: string) => {
        // Mock fallback logic if order.paymentData is empty
        const normalized = method.toLowerCase();

        // 1. Try Real Data
        if (order?.paymentData && (order.paymentData as any).va_numbers?.[0]) {
            const va = (order.paymentData as any).va_numbers[0];
            return {
                name: `Virtual Account ${va.bank.toUpperCase()}`,
                number: va.va_number,
                icon: <InitialIcon letter={va.bank[0].toUpperCase()} />,
                color: 'text-zinc-900'
            };
        }

        // 2. Mock Fallback
        if (normalized.includes('bca')) return { name: 'Virtual Account BCA', number: '880123456789', icon: <InitialIcon letter="B" color="bg-blue-600" />, color: 'text-blue-600' };
        if (normalized.includes('mandiri')) return { name: 'Virtual Account Mandiri', number: '8870123456789', icon: <InitialIcon letter="M" color="bg-yellow-600" />, color: 'text-yellow-600' };
        if (normalized.includes('bni')) return { name: 'Virtual Account BNI', number: '8241123456789', icon: <InitialIcon letter="B" color="bg-orange-600" />, color: 'text-orange-600' };
        if (normalized.includes('bri')) return { name: 'Virtual Account BRI', number: '7823123456789', icon: <InitialIcon letter="R" color="bg-blue-700" />, color: 'text-blue-700' };

        return { name: 'Virtual Account Bank', number: '1234567890', icon: <InitialIcon letter="Bank" />, color: 'text-zinc-600' };
    };

    const paymentInfo = getPaymentDetails(paymentMethod);

    // --- Actions ---
    const fetchData = async (background = false) => {
        if (!paymentId) return;
        if (!background) setLoading(true);
        try {
            // Active verification if background (polling) or explicitly requested
            let data;
            if (background) {
                data = await marketplaceService.checkPaymentStatus(paymentId);
            } else {
                data = await marketplaceService.getOrderDetails(paymentId);
            }
            setOrder(data);
            if (data.paymentMethod) setPaymentMethod(data.paymentMethod);

            // Calculate expiry
            if (data.expiryTime && data.paymentStatus === 'pending') {
                const end = new Date(data.expiryTime);
                const diff = differenceInSeconds(end, new Date());
                setTimeLeftSeconds(diff > 0 ? diff : 0);
            }
        } catch (e) {
            console.error("Failed to load order", e);
            if (!background) toast.error("Gagal memuat data pesanan");
        } finally {
            if (!background) setLoading(false);
        }
    };

    const handleVerifyParams = async () => {
        if (!paymentId) return;
        setIsPolling(true);
        try {
            // Trigger Manual Check
            // In a real app, this might hit an endpoint that forces a gateway status check
            // For now, allow simple refresh
            await fetchData(true);

            // In Mock, we can simulate a random success if user wants (optional)
            // But per requirement "System determines success", we just check.
            toast.info("Mengecek status pembayaran...");
        } catch (e) {
            toast.error("Gagal mengecek status");
        } finally {
            // Min loading time for UX
            setTimeout(() => setIsPolling(false), 2000);
        }
    };

    // --- Effects ---
    useEffect(() => {
        fetchData();
        // Auto-poll every 30s
        const poll = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(poll);
    }, [paymentId]);

    // Countdown Timer
    useEffect(() => {
        if (timeLeftSeconds === null || isPaid || isFailed) return;
        if (timeLeftSeconds <= 0) return;

        const timer = setInterval(() => {
            setTimeLeftSeconds(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeftSeconds, isPaid, isFailed]);

    // --- Renders ---
    if (loading && !order) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    // 1. Header Logic
    let headerTitle = "Selesaikan Pembayaran";
    let headerBg = "bg-primary";
    let headerIcon = <Clock className="w-5 h-5 text-white/90" />;

    if (isPaid) {
        headerTitle = "Pembayaran Berhasil";
        headerBg = "bg-green-600";
        headerIcon = <CheckCircle2 className="w-5 h-5 text-white" />;
    } else if (isFailed) {
        headerTitle = "Pembayaran Gagal";
        headerBg = "bg-red-600";
        headerIcon = <Ban className="w-5 h-5 text-white" />;
    } else if (isExpired) {
        headerTitle = "Pembayaran Kedaluwarsa";
        headerBg = "bg-zinc-600";
        headerIcon = <AlertCircle className="w-5 h-5 text-white" />;
    } else if (isPolling) {
        headerTitle = "Mengecek Pembayaran...";
        headerBg = "bg-blue-600";
        headerIcon = <Loader2 className="w-5 h-5 text-white animate-spin" />;
    }

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
            {/* 1. Header / App Bar */}
            <div className={cn("transition-colors duration-300 shadow-sm sticky top-0 z-20", headerBg)}>
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 text-white rounded-full h-8 w-8 disabled:opacity-50"
                            onClick={() => navigate(-1)}
                            disabled={isPolling || isPaid}
                        >
                            <ChevronRight className="h-5 w-5 rotate-180" />
                        </Button>
                        <div className="flex items-center gap-2 font-medium text-sm md:text-base">
                            {headerIcon}
                            <span>{headerTitle}</span>
                        </div>
                    </div>

                    {/* Help Icon -> Support Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                                <HelpCircle className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8">
                            <SheetHeader className="mb-4 text-left">
                                <SheetTitle>Bantuan Pembayaran</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4">
                                <HelpItem
                                    title="Pembayaran belum terverifikasi?"
                                    desc="Sistem mengecek transaksi secara otomatis. Jika status tidak berubah dalam 10 menit, mohon hubungi CS."
                                />
                                <HelpItem
                                    title="Salah nominal transfer?"
                                    desc="Pembayaran mungkin ditolak sistem. Silakan hubungi CS untuk bantuan pengembalian dana (jika terdebet)."
                                />
                                <HelpItem
                                    title="Waktu pembayaran habis?"
                                    desc="Silakan buat pesanan baru. Pembayaran ke VA yang kedaluwarsa akan otomatis ditolak oleh bank."
                                />
                                <Button className="w-full mt-4" variant="default">Hubungi Customer Support</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col gap-4 pb-24">

                {/* 2. Payment Summary */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardContent className="p-5 text-center space-y-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Pembayaran</p>
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-3xl font-bold text-primary tracking-tight">
                                {formatCurrency(Number(order.totalAmount))}
                            </h2>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400" onClick={() => {
                                navigator.clipboard.writeText(order.totalAmount.toString());
                                toast.success("Nominal disalin");
                            }}>
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <p className="text-xs text-zinc-400">Termasuk pajak & biaya admin</p>
                    </CardContent>
                </Card>

                {/* 3. Countdown & Expiry */}
                {!isPaid && !isFailed && (
                    <div className={cn(
                        "rounded-xl px-4 py-3 flex items-center justify-between border",
                        isExpired
                            ? "bg-zinc-100 border-zinc-200 text-zinc-500"
                            : "bg-orange-50 border-orange-100 text-orange-700"
                    )}>
                        <span className="text-sm font-medium">
                            {isExpired ? "Waktu pembayaran telah habis" : "Bayar dalam waktu"}
                        </span>
                        {!isExpired && (
                            <div className="font-mono font-bold text-lg tabular-nums">
                                {timeLeftSeconds !== null ? formatTime(timeLeftSeconds) : '--:--'}
                            </div>
                        )}
                    </div>
                )}

                {/* Content based on State */}
                {isPaid ? (
                    <SuccessView order={order} navigate={navigate} />
                ) : isExpired ? (
                    <ExpiredView navigate={navigate} />
                ) : isFailed ? (
                    <FailedView navigate={navigate} />
                ) : (
                    <>
                        {/* 4. Payment Method Card */}
                        <Card className="border shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-zinc-700">Metode Pembayaran</h3>
                                    <Button
                                        variant="link"
                                        className="text-primary text-xs h-auto p-0 font-semibold"
                                        onClick={() => setIsMethodDialogOpen(true)}
                                    >
                                        Ganti Metode
                                    </Button>
                                    {/* Dialog for Changing Method */}
                                    <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Pilih Metode Pembayaran</DialogTitle></DialogHeader>
                                            <RadioGroup value={paymentMethod} onValueChange={(v) => {
                                                setPaymentMethod(v);
                                                setIsMethodDialogOpen(false);
                                                toast.success("Metode pembayaran diperbarui");
                                                // Ideally trigger API update here
                                            }} className="gap-2 mt-2">
                                                {BANKS.map(bank => (
                                                    <div key={bank.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <InitialIcon letter={bank.name.includes('BCA') ? 'BCA' : bank.name[0]} className="text-[10px]" />
                                                            <span className="text-sm font-medium">{bank.name}</span>
                                                        </div>
                                                        <RadioGroupItem value={bank.id} id={bank.id} />
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                                    <div className="h-10 w-10 bg-white rounded flex items-center justify-center shadow-sm text-[10px] overflow-hidden">
                                        {paymentInfo.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-zinc-900">{paymentInfo.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <p className="text-[11px] text-zinc-500">Verifikasi Otomatis ±1-5 menit</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. Payment Destination (Criticial) */}
                        <Card className="border shadow-sm">
                            <CardContent className="p-5 space-y-6">
                                {/* VA Display */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 mb-2 block uppercase">Nomor Virtual Account</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 font-mono text-xl font-bold tracking-wider text-zinc-800 text-center select-all">
                                            {paymentInfo.number.match(/.{1,4}/g)?.join(' ')}
                                        </div>
                                        <Button variant="outline" className="h-[52px] w-[52px] shrink-0" onClick={() => {
                                            navigator.clipboard.writeText(paymentInfo.number);
                                            toast.success("Nomor VA disalin");
                                        }}>
                                            <Copy className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* 5.2 Nominal Warning */}
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-amber-800 uppercase">Penting!</p>
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Transfer harus <span className="font-bold underline">SAMA PERSIS</span> dengan total tagihan
                                            (<span className="font-mono font-bold">{formatCurrency(Number(order.totalAmount))}</span>).
                                            <br />Jangan dibulatkan agar sistem dapat memverifikasi otomatis.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 6. Instructions */}
                        <div className="pt-2">
                            <h3 className="text-sm font-semibold mb-3 px-1 text-zinc-700">Cara Pembayaran</h3>
                            <Accordion type="single" collapsible className="w-full bg-white border rounded-xl shadow-sm overflow-hidden">
                                <InstructionItem value="mbanking" title="Via Mobile Banking">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600">
                                        <li>Login ke aplikasi Mobile Banking Anda</li>
                                        <li>Pilih menu <span className="font-semibold">Bayar / Transfer</span></li>
                                        <li>Pilih <span className="font-semibold">Virtual Account</span></li>
                                        <li>Masukkan nomor: <span className="font-mono bg-zinc-100 px-1 font-bold">{paymentInfo.number}</span></li>
                                        <li>Pastikan nominal yang muncul sesuai: <span className="font-semibold text-primary">{formatCurrency(Number(order.totalAmount))}</span></li>
                                        <li>Masukkan PIN untuk konfirmasi</li>
                                    </ol>
                                </InstructionItem>
                                <InstructionItem value="atm" title="Via ATM">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600">
                                        <li>Masukkan kartu ATM & PIN</li>
                                        <li>Pilih menu <span className="font-semibold">Transaksi Lainnya</span></li>
                                        <li>Pilih <span className="font-semibold">Transfer ke Virtual Account</span></li>
                                        <li>Masukkan nomor VA: <span className="font-mono bg-zinc-100 px-1 font-bold">{paymentInfo.number}</span></li>
                                        <li>Ikuti petunjuk di layar</li>
                                    </ol>
                                </InstructionItem>
                            </Accordion>
                        </div>
                    </>
                )}

                {/* 10. Trust Signals (Global) */}
                <div className="flex items-center justify-center gap-4 py-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                        <Lock className="h-3 w-3" />
                        Transaksi Aman & Terenkripsi
                    </div>
                </div>

            </main>

            {/* 9. Sticky Bottom Action (System Driven) */}
            {!isPaid && !isFailed && !isExpired && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t z-10">
                    <div className="max-w-md mx-auto space-y-2">
                        {/* Auto-verification Feedback */}
                        {status === 'pending' && !isPolling && (
                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 animate-pulse">
                                <RefreshCw className="h-3 w-3 animate-spin duration-[3000ms]" />
                                Menunggu pembayaran masuk...
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                            size="lg"
                            onClick={handleVerifyParams}
                            disabled={isPolling}
                        >
                            {isPolling ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mengecek Pembayaran...
                                </>
                            ) : (
                                "Cek Status Pembayaran"
                            )}
                        </Button>
                    </div>

                    {/* DEV: Simulation Tools */}
                    <div className="max-w-md mx-auto mt-4 pt-4 border-t border-dashed border-zinc-200 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-center text-zinc-400 mb-2 font-mono">⚠️ DEV: SIMULATE GATEWAY EVENT</p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={async () => {
                                setIsPolling(true);
                                await marketplaceService.simulatePayment(paymentId!, 'success');
                                handleVerifyParams(); // Trigger check immediately
                            }}>
                                Force Paid
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={async () => {
                                setIsPolling(true);
                                await marketplaceService.simulatePayment(paymentId!, 'failed');
                                handleVerifyParams();
                            }}>
                                Force Failed
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components ---

function InitialIcon({ letter, className, color }: { letter: string, className?: string, color?: string }) {
    return (
        <div className={cn("h-8 w-8 rounded bg-zinc-100 flex items-center justify-center font-bold text-zinc-600", color?.replace('text-', 'bg-'), className)}>
            {letter}
        </div>
    );
}

function HelpItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-3 bg-zinc-50 rounded-lg">
            <h4 className="font-semibold text-sm text-zinc-900 mb-1">{title}</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function InstructionItem({ value, title, children }: any) {
    return (
        <AccordionItem value={value} className="border-b last:border-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-zinc-50 hover:no-underline text-sm font-medium">
                {title}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
                {children}
            </AccordionContent>
        </AccordionItem>
    );
}

function SuccessView({ order, navigate }: { order: Order, navigate: any }) {
    return (
        <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900">Pembayaran Diterima!</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                    Terima kasih! Pesanan <span className="font-mono font-bold text-zinc-900">#{order.id.slice(0, 8)}</span> sedang diproses oleh penjual.
                </p>
            </div>
            <div className="pt-4 space-y-3">
                <Button className="w-full h-11" onClick={() => navigate('/marketplace/my-orders')}>
                    Lihat Status Pesanan
                </Button>
                <Button variant="outline" className="w-full h-11" onClick={() => navigate('/marketplace')}>
                    Kembali ke Beranda
                </Button>
            </div>
        </div>
    );
}

function ExpiredView({ navigate }: { navigate: any }) {
    return (
        <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-zinc-400" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Pembayaran Kedaluwarsa</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                    Batas waktu pembayaran telah habis. Silakan lakukan pemesanan ulang.
                </p>
            </div>
            <Button className="w-full" variant="default" onClick={() => navigate('/marketplace')}>
                Buat Pesanan Baru
            </Button>
        </div>
    );
}

function FailedView({ navigate }: { navigate: any }) {
    return (
        <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Ban className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Pembayaran Gagal</h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                    Terjadi masalah saat memproses pembayaran. Silakan coba metode lain.
                </p>
            </div>
            <Button className="w-full" variant="outline" onClick={() => navigate(-1)}>
                Coba Metode Lain
            </Button>
        </div>
    );
}

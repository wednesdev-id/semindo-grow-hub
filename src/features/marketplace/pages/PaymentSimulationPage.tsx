import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceService, Order } from '@/services/marketplaceService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils'; // Keep utilities

export default function PaymentSimulationPage() {
    const { paymentId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth State
    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(326); // 5m 26s as requested default
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Order Data
    useEffect(() => {
        const fetchOrder = async () => {
            if (!paymentId) return;
            try {
                const data = await marketplaceService.getOrderDetails(paymentId);
                setOrder(data);

                // If already paid, redirect
                if (data.paymentStatus === 'paid') {
                    navigate('/marketplace/my-orders');
                    toast.success("Pembayaran berhasil dikonfirmasi");
                }
            } catch (e) {
                console.error("Failed to load order", e);
                toast.error("Gagal memuat data transaksi");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [paymentId, navigate]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend Cooldown
    useEffect(() => {
        if (isResendDisabled) {
            const timer = setTimeout(() => setIsResendDisabled(false), 30000); // 30s cooldown
            return () => clearTimeout(timer);
        }
    }, [isResendDisabled]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s.toString().padStart(2, '0')}s`;
    };

    const handleOtpSubmit = async () => {
        if (!paymentId || !order) return;

        setError(null);
        setIsSubmitting(true);

        try {
            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (otp === "123456" || otp.length === 6) {
                // Success Flow
                await marketplaceService.simulatePayment(paymentId, 'success');
                toast.success("Autentikasi Berhasil");
                navigate('/marketplace/my-orders');
            } else {
                // Failure Flow (Mock)
                setError("Kode OTP tidak valid");
                setOtp("");
            }
        } catch (e) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!paymentId) return;
        try {
            await marketplaceService.simulatePayment(paymentId, 'failed');
            toast.info("Transaksi dibatalkan");
            navigate('/marketplace/cart');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
            {/* 1. Header / Brand Authority Section */}
            <div className="h-16 border-b flex items-center justify-between px-6 lg:px-12 bg-white">
                {/* Bank Logo (Mock BCA Style) */}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-auto aspect-[3/1] bg-blue-700 text-white flex items-center justify-center px-2 font-bold italic tracking-tighter text-lg rounded-sm">
                        BCA
                    </div>
                </div>
                {/* Network Logo */}
                <div className="flex items-col text-right">
                    <div className="text-[10px] font-bold text-slate-500 italic leading-none">Mastercard</div>
                    <div className="text-sm font-bold text-slate-700 italic leading-none">SecureCode</div>
                </div>
            </div>

            <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8 flex flex-col gap-8">

                {/* 2. Authorization Title & Timer */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-900">Authentication Required</h1>
                    </div>

                    {/* Time Sensitivity Indicator */}
                    {timeLeft > 0 ? (
                        <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 p-3 rounded border border-red-100">
                            <span className="uppercase text-[10px] tracking-wider font-extrabold">Remaining:</span>
                            <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 p-3 rounded border border-red-100">
                            <span className="uppercase text-[10px] tracking-wider font-extrabold">Expired</span>
                            <span className="font-mono text-base">Session Timed Out</span>
                        </div>
                    )}
                </div>

                {/* 3. Authentication Explanation */}
                <div className="text-sm text-slate-600 leading-relaxed border-l-4 border-blue-600 pl-4 py-1">
                    <p>
                        To authenticate this transaction, we have sent a <span className="font-semibold">One Time Password (OTP)</span> to <span className="font-mono font-semibold">+6282••••••099</span>.
                    </p>
                    <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                        <span>Card: •••• •••• •••• 0063</span>
                        <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* 4. Transaction Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Transaction Amount</p>
                            <p className="font-bold text-slate-900 text-lg font-mono">{formatCurrency(Number(order.totalAmount))}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Merchant</p>
                            <p className="font-bold text-slate-900 text-lg">Semindo Market</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-200 mt-2">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Reference ID</p>
                            <p className="font-mono text-slate-700">{order.id}</p>
                        </div>
                    </div>
                </div>

                {/* 5. OTP Input Area (Primary) */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">One Time Password</label>
                        <div className="flex gap-3">
                            <Input
                                disabled={timeLeft <= 0}
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                className="font-mono text-lg tracking-widest h-12 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                            <Button
                                className="h-12 w-24 bg-blue-700 hover:bg-blue-800 font-bold text-base"
                                onClick={handleOtpSubmit}
                                disabled={otp.length !== 6 || isSubmitting || timeLeft <= 0}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "OK"}
                            </Button>
                        </div>
                        {error && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" />
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* 6. Secondary Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className="flex-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                        onClick={() => {
                            setIsResendDisabled(true);
                            toast.info("OTP baru telah dikirim");
                        }}
                        disabled={isResendDisabled || timeLeft <= 0}
                    >
                        {isResendDisabled ? "Resend OTP (30s)" : "Resend OTP"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        onClick={handleCancel}
                    >
                        Cancel Transaction
                    </Button>
                </div>

            </div>

            {/* 7. Help & Contact Information */}
            <div className="bg-slate-100 border-t py-6 px-6 mt-auto">
                <div className="max-w-lg mx-auto text-center space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Please contact us for assistance</p>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" /> Halo BCA 1500 888
                        </span>
                        <span className="flex items-center gap-1">
                            <MailIcon className="h-3 w-3" /> halobca@bca.co.id
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircleIcon className="h-3 w-3" /> @halobca
                        </span>
                    </div>
                    <div className="pt-4 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Lock className="h-3 w-3" />
                        <span>Secured by Mastercard Identity Check</span>
                    </div>
                </div>
            </div>
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

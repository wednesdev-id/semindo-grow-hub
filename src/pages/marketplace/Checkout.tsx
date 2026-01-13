import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, CreditCard, Wallet, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';
import { toast } from 'sonner';
import { marketplaceService } from '@/services/marketplaceService';
import { EmptyState } from '@/components/ui/empty-state';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: authLoading } = useAuth();
    const { items, total, clearCart } = useCart();
    const [processing, setProcessing] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || user?.umkmProfile?.phone || '',
        address: user?.umkmProfile?.address || '',
        city: user?.umkmProfile?.city || '',
        province: user?.umkmProfile?.province || '',
        postalCode: user?.umkmProfile?.postalCode || '',
        courier: 'JNE', // Default courier
        notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('manual');
    const [shippingCost, setShippingCost] = useState(0);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [voucher, setVoucher] = useState('');
    const [discount, setDiscount] = useState(0);
    const [applyingVoucher, setApplyingVoucher] = useState(false);

    // Sync user data when it becomes available
    useEffect(() => {
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                fullName: prev.fullName || user.fullName || '',
                phone: prev.phone || user.phone || user.umkmProfile?.phone || '',
                address: prev.address || user.umkmProfile?.address || '',
                city: prev.city || user.umkmProfile?.city || '',
                province: prev.province || user.umkmProfile?.province || '',
                postalCode: prev.postalCode || user.umkmProfile?.postalCode || '',
            }));
        }
    }, [user]);

    // Strict Auth Redirect
    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Login diperlukan untuk mengakses halaman checkout');
            navigate('/login', {
                state: { from: location.pathname },
                replace: true
            });
        }
    }, [user, authLoading, navigate, location.pathname]);

    // Group items by seller
    const groupedItems = items.reduce((acc, item) => {
        const seller = item.seller || 'Unknown Seller';
        if (!acc[seller]) acc[seller] = [];
        acc[seller].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    const sellerList = Object.keys(groupedItems);

    // Mock shipping calculation per seller
    useEffect(() => {
        const calculateTotalShipping = async () => {
            if (!shippingAddress.city || !shippingAddress.courier || sellerList.length === 0) {
                setShippingCost(0);
                return;
            }

            setCalculatingShipping(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            let totalShipping = 0;
            // In a real scenario, we might call an API that takes [ origin_cities, destination_city, weight_per_origin ]
            // Here we mock per seller
            sellerList.forEach((seller, index) => {
                const baseCost = 15000;
                const courierMultiplier = { JNE: 1, Sicepat: 0.9, 'J&T': 1.1, Anteraja: 0.8 }[shippingAddress.courier] || 1;
                // Add some variance per seller to make it look realistic
                const sellerOffset = (index * 2000);
                const cityComplexity = (shippingAddress.city.length % 5) * 1000;

                totalShipping += (baseCost * courierMultiplier + cityComplexity + sellerOffset);
            });

            setShippingCost(totalShipping);
            setCalculatingShipping(false);
        };

        calculateTotalShipping();
    }, [shippingAddress.city, shippingAddress.courier, sellerList.length]);

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <SEOHead title="Checkout - Marketplace UMKM" description="Complete your purchase" />
                <Navigation />

                <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
                    <div className="py-12">
                        <EmptyState
                            title="Keranjang Anda Kosong"
                            description="Silakan tambahkan produk ke keranjang terlebih dahulu sebelum checkout."
                            icon={ShoppingCart}
                            action={{
                                label: "Mulai Belanja",
                                to: "/marketplace"
                            }}
                            className="bg-card border-2 border-dashed rounded-xl"
                        />
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate shipping address
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
            toast.error('Mohon lengkapi informasi pengiriman');
            return;
        }

        // Validate postal code (5 digits for Indonesia)
        const postalCodeRegex = /^\d{5}$/;
        if (shippingAddress.postalCode && !postalCodeRegex.test(shippingAddress.postalCode)) {
            toast.error('Kode pos harus terdiri dari 5 digit angka');
            return;
        }

        try {
            setProcessing(true);
            console.log('[ANALYTICS] Checkout Started', { itemsCount: items.length, total });

            // Prepare order items
            const orderItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));

            // Call real API
            const response = await marketplaceService.createOrder(orderItems, { ...shippingAddress, paymentMethod }, shippingCost) as any;

            // The response structure from api.post is the JSON body { data: Order }
            const order = response.data;

            if (!order || !order.id) {
                throw new Error('Invalid order response');
            }

            console.log('[ANALYTICS] Checkout Completed', { orderId: order.id });

            // Clear cart after successful order
            clearCart();

            // Show success message
            toast.success('Pesanan berhasil dibuat! Mengalihkan ke pembayaran...');

            // Redirect to Payment Simulation Page
            setTimeout(() => {
                navigate(`/payment-simulation/${order.id}`);
            }, 1000);

        } catch (error: any) {
            console.error('Failed to create order:', error);
            // Show specific error if available
            const errorMessage = error.message || 'Gagal membuat pesanan. Silakan coba lagi.';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const finalTotal = total + shippingCost - discount;

    const handleApplyVoucher = async () => {
        if (!voucher) return;
        setApplyingVoucher(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        if (voucher.toUpperCase() === 'BANGGAUMKM') {
            setDiscount(20000);
            toast.success('Voucher berhasil digunakan! Potongan Rp 20.000');
        } else {
            toast.error('Voucher tidak valid atau sudah kadaluarsa');
        }
        setApplyingVoucher(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <SEOHead title="Checkout - Marketplace UMKM" description="Complete your purchase" />
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/marketplace/cart')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Keranjang
                </Button>

                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                {/* Progress Stepper */}
                <div className="mb-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted w-full -z-10" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary w-1/2 -z-10" />

                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                            <span className="text-xs mt-2 font-medium">Keranjang</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ring-4 ring-background">2</div>
                            <span className="text-xs mt-2 font-medium">Pengiriman</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">3</div>
                            <span className="text-xs mt-2 font-medium text-muted-foreground">Pembayaran</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Informasi Pengiriman</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="fullName">Nama Lengkap *</Label>
                                            <Input
                                                id="fullName"
                                                value={shippingAddress.fullName}
                                                onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Nomor Telepon *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={shippingAddress.phone}
                                                onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="address">Alamat Lengkap *</Label>
                                            <Textarea
                                                id="address"
                                                value={shippingAddress.address}
                                                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">Kota *</Label>
                                            <Input
                                                id="city"
                                                value={shippingAddress.city}
                                                onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="province">Provinsi</Label>
                                            <Input
                                                id="province"
                                                value={shippingAddress.province}
                                                onChange={e => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Kode Pos</Label>
                                            <Input
                                                id="postalCode"
                                                value={shippingAddress.postalCode}
                                                onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="courier">Pilihan Kurir *</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                                                {['JNE', 'Sicepat', 'J&T', 'Anteraja'].map((c) => (
                                                    <Button
                                                        key={c}
                                                        type="button"
                                                        variant={shippingAddress.courier === c ? 'default' : 'outline'}
                                                        className="h-10"
                                                        onClick={() => setShippingAddress({ ...shippingAddress, courier: c })}
                                                    >
                                                        {c}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="notes">Catatan Pengiriman</Label>
                                            <Textarea
                                                id="notes"
                                                value={shippingAddress.notes}
                                                onChange={e => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                                                rows={2}
                                                placeholder="Catatan tambahan untuk kurir (opsional)"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Metode Pembayaran</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5 border-primary">
                                            <Wallet className="h-6 w-6 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-semibold">Transfer Manual (MVP)</p>
                                                <p className="text-sm text-muted-foreground">Detail pembayaran akan dikirim setelah order</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 border rounded-lg opacity-50">
                                            <CreditCard className="h-6 w-6" />
                                            <div className="flex-1">
                                                <p className="font-semibold">Pembayaran Online</p>
                                                <p className="text-sm text-muted-foreground">Segera hadir</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>
                                    <div className="space-y-6 mb-6">
                                        {sellerList.map((seller) => (
                                            <div key={seller} className="space-y-3">
                                                <div className="flex items-center gap-2 pb-2 border-b border-dashed">
                                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <ShoppingCart className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        Pesanan dari {seller}
                                                    </h3>
                                                </div>
                                                <div className="space-y-4 pt-1">
                                                    {groupedItems[seller].map((item) => (
                                                        <div key={item.id} className="flex gap-3">
                                                            <img
                                                                src={item.image || '/api/placeholder/60/60'}
                                                                alt={item.name}
                                                                className="w-14 h-14 object-cover rounded-lg border shadow-sm"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-xs line-clamp-2 leading-tight">{item.name}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                                    Jumlah: <span className="font-bold text-foreground">{item.quantity}</span>
                                                                </p>
                                                            </div>
                                                            <p className="font-bold text-xs">
                                                                Rp {(Number(item.price.toString().replace(/[^0-9]/g, '')) * item.quantity).toLocaleString('id-ID')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center">
                                                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                                                Metode Pembayaran
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { id: 'va', name: 'Virtual Account (Otomatis)', desc: 'BCA, Mandiri, BRI' },
                                                    { id: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, ShopeePay' },
                                                    { id: 'manual', name: 'Transfer Manual', desc: 'Konfirmasi manual via WhatsApp' }
                                                ].map((m) => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => setPaymentMethod(m.id)}
                                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === m.id
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'hover:border-primary/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-sm">{m.name}</p>
                                                                <p className="text-xs text-muted-foreground">{m.desc}</p>
                                                            </div>
                                                            {m.id === 'va' || m.id === 'ewallet' ? (
                                                                <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">REAL-TIME</div>
                                                            ) : (
                                                                <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-bold">MANUAL</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t space-y-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Kode Voucher (e.g. BANGGAUMKM)"
                                                    value={voucher}
                                                    onChange={(e) => setVoucher(e.target.value)}
                                                    className="text-sm"
                                                    disabled={discount > 0}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleApplyVoucher}
                                                    disabled={applyingVoucher || !voucher || discount > 0}
                                                >
                                                    {applyingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gunakan'}
                                                </Button>
                                            </div>

                                            {discount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                                    <span>Diskon Voucher</span>
                                                    <span>- Rp {discount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Subtotal</span>
                                                <span className="text-sm font-medium">Rp {total.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Ongkos Kirim</span>
                                                {calculatingShipping ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <span>{shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Pilih kurir'}</span>
                                                )}
                                            </div>
                                            <div className="border-t pt-3">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Total</span>
                                                    <span className="text-primary">Rp {finalTotal.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Buat Pesanan'
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-4">
                                        Dengan membuat pesanan, Anda menyetujui Syarat dan Ketentuan kami
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}

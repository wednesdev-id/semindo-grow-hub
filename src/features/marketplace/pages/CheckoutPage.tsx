import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { marketplaceService } from '@/services/marketplaceService';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
    fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
    address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
    city: z.string().min(3, 'Kota harus diisi'),
    postalCode: z.string().min(5, 'Kode pos harus diisi'),
});

interface CartItem {
    id: string; // CartItem ID
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    seller: string;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const cart = await marketplaceService.getCart();
                if (cart && cart.items && cart.items.length > 0) {
                    const items = cart.items.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        name: item.variant ? `${item.product.title} - ${item.variant.name}` : item.product.title,
                        price: Number(item.variant ? item.variant.price : item.product.price),
                        image: (item.variant && item.variant.image) ? item.variant.image : (item.product.images?.[0] || "/api/placeholder/300/200"),
                        quantity: item.quantity,
                        seller: item.product.store?.name || 'Unknown Store'
                    }));
                    setCartItems(items);
                } else {
                    navigate('/marketplace/cart');
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error);
                navigate('/marketplace/cart');
            }
        };
        fetchCart();
    }, [navigate]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
        },
    });

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId
            }));

            const response: any = await marketplaceService.createOrder(orderItems);

            // In a real app, we would save the shipping address too.
            // For this MVP, we just create the order and show payment link.

            if (response.data && response.data.paymentLink) {
                setPaymentLink(response.data.paymentLink);
                setShowSuccessDialog(true);
                // Cart is cleared on backend or we can call clearCart
                await marketplaceService.clearCart();
                window.dispatchEvent(new Event('storage'));
            } else {
                toast.error('Gagal membuat pesanan: Link pembayaran tidak ditemukan');
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal membuat pesanan');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 container py-20">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pengiriman</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Lengkap</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nama Penerima" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nomor Telepon</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Alamat Lengkap</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Jalan, No. Rumah, RT/RW" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kota/Kabupaten</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Kota" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kode Pos</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Kode Pos" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate w-2/3">{item.name} x {item.quantity}</span>
                                            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Tagihan</span>
                                    <span className="text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Bayar Sekarang
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            Pesanan Berhasil Dibuat!
                        </DialogTitle>
                        <DialogDescription>
                            Silakan selesaikan pembayaran anda melalui link berikut.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Input
                                id="link"
                                defaultValue={paymentLink || ''}
                                readOnly
                            />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={() => {
                            navigator.clipboard.writeText(paymentLink || '');
                            toast.success('Link disalin!');
                        }}>
                            <span className="sr-only">Copy</span>
                            Salin
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/marketplace')}
                        >
                            Kembali ke Marketplace
                        </Button>
                        <Button
                            type="button"
                            onClick={() => window.open(paymentLink || '', '_blank')}
                        >
                            Buka Link Pembayaran
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

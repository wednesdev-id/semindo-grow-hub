import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';

interface CartItem {
    id: string;
    product: {
        id: string;
        title: string;
        price: number;
        images: string[];
    };
    quantity: number;
}

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        notes: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadCart();
    }, [user]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getCart();
            if (!data || data.items.length === 0) {
                navigate('/marketplace/cart');
                return;
            }
            setCart(data);
        } catch (error) {
            console.error('Failed to load cart:', error);
            navigate('/marketplace/cart');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cart || cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Validate shipping address
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
            alert('Please fill in all required shipping information');
            return;
        }

        try {
            setProcessing(true);

            // Create order with cart items
            const items = cart.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
            }));

            const orderResponse = await marketplaceService.createOrder(items);

            // Clear cart after successful order
            await marketplaceService.clearCart();

            // Mock payment success
            alert('Order placed successfully! Payment is pending.');
            navigate('/marketplace/orders');
        } catch (error) {
            console.error('Failed to create order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!cart) return null;

    const shippingCost = 0; // Free shipping for MVP
    const total = cart.total + shippingCost;

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
                    Back to Cart
                </Button>

                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                value={shippingAddress.fullName}
                                                onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={shippingAddress.phone}
                                                onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="address">Address *</Label>
                                            <Textarea
                                                id="address"
                                                value={shippingAddress.address}
                                                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={shippingAddress.city}
                                                onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="province">Province</Label>
                                            <Input
                                                id="province"
                                                value={shippingAddress.province}
                                                onChange={e => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                value={shippingAddress.postalCode}
                                                onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="notes">Delivery Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={shippingAddress.notes}
                                                onChange={e => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
                                                rows={2}
                                                placeholder="Optional delivery instructions"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5 border-primary">
                                            <Wallet className="h-6 w-6 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-semibold">Manual Transfer (MVP)</p>
                                                <p className="text-sm text-muted-foreground">Payment details will be sent after order</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 border rounded-lg opacity-50">
                                            <CreditCard className="h-6 w-6" />
                                            <div className="flex-1">
                                                <p className="font-semibold">Online Payment</p>
                                                <p className="text-sm text-muted-foreground">Coming soon</p>
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
                                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                    <div className="space-y-4 mb-6">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-3">
                                                <img
                                                    src={item.product.images?.[0] || '/api/placeholder/60/60'}
                                                    alt={item.product.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm line-clamp-2">{item.product.title}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-sm">
                                                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3 mb-6 border-t pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>Rp {cart.total.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className="text-green-600">FREE</span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
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
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-4">
                                        By placing this order, you agree to our Terms and Conditions
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

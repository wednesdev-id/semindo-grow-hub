import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';

interface CartItem {
    id: string;
    product: {
        id: string;
        title: string;
        price: number;
        images: string[];
        stock: number;
        slug: string;
    };
    quantity: number;
}

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

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
            setCart(data);
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        try {
            setUpdating(itemId);
            await marketplaceService.updateCartItem(itemId, newQuantity);
            await loadCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            alert('Failed to update quantity');
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (itemId: string) => {
        if (!confirm('Remove this item from cart?')) return;
        try {
            setUpdating(itemId);
            await marketplaceService.removeFromCart(itemId);
            await loadCart();
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Failed to remove item');
        } finally {
            setUpdating(null);
        }
    };

    const clearCart = async () => {
        if (!confirm('Clear all items from cart?')) return;
        try {
            setLoading(true);
            await marketplaceService.clearCart();
            await loadCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
            alert('Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const isEmpty = !cart || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <SEOHead title="Shopping Cart - Marketplace UMKM" description="Manage your shopping cart" />
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {isEmpty ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-6">Add some products to get started</p>
                            <Button asChild>
                                <Link to="/marketplace">Browse Products</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <img
                                                src={item.product.images?.[0] || '/api/placeholder/100/100'}
                                                alt={item.product.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <Link
                                                    to={`/marketplace/product/${item.product.slug}`}
                                                    className="font-semibold hover:text-primary mb-2 block"
                                                >
                                                    {item.product.title}
                                                </Link>
                                                <p className="text-lg font-bold text-primary mb-3">
                                                    Rp {item.product.price.toLocaleString('id-ID')}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updating === item.id}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-12 text-center">{item.quantity}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.product.stock || updating === item.id}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={updating === item.id}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={clearCart}>
                                    Clear Cart
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/marketplace">Continue Shopping</Link>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>Rp {cart.total.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className="text-sm text-green-600">Calculated at checkout</span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-primary">Rp {cart.total.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="w-full" size="lg" asChild>
                                        <Link to="/marketplace/checkout">
                                            Proceed to Checkout
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

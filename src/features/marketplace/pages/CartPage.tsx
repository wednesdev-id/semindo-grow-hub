import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

import { marketplaceService } from '@/services/marketplaceService';
import { toast } from 'sonner';

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

export default function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const fetchCart = async () => {
        try {
            const cart = await marketplaceService.getCart();
            if (cart && cart.items) {
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
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (id: string) => {
        try {
            await marketplaceService.removeFromCart(id);
            setCartItems(prev => prev.filter(item => item.id !== id));
            toast.success('Item dihapus dari keranjang');
            window.dispatchEvent(new Event('storage')); // Update header count if needed
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Gagal menghapus item');
        }
    };

    const handleUpdateQuantity = async (id: string, delta: number) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return;

        try {
            // Optimistic update
            setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));

            await marketplaceService.updateCartItem(id, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            // Revert on error
            setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: item.quantity } : i));
            toast.error('Gagal update quantity');
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 container py-20">
                <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Keranjang Anda Kosong</h2>
                        <p className="text-muted-foreground mb-6">Yuk, mulai belanja produk UMKM favoritmu!</p>
                        <Button asChild>
                            <Link to="/marketplace">Mulai Belanja</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">{item.seller}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="font-bold text-primary">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive ml-2"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Ringkasan Belanja</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Harga ({cartItems.length} barang)</span>
                                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Tagihan</span>
                                        <span className="text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" size="lg" onClick={() => navigate('/marketplace/checkout')}>
                                        Checkout
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

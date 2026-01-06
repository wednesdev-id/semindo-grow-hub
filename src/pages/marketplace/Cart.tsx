import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package } from 'lucide-react';
import SEOHead from '@/components/ui/seo-head';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';

export default function Cart() {
    const { toast } = useToast();
    const { items, itemCount, total, updateQuantity, removeFromCart, clearCart } = useCart();

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        updateQuantity(productId, newQuantity);
        toast({
            title: "Berhasil",
            description: "Jumlah produk diperbarui",
        });
    };

    const handleRemoveItem = (productId: string) => {
        if (!confirm('Hapus produk ini dari keranjang?')) return;

        removeFromCart(productId);
        toast({
            title: "Berhasil",
            description: "Produk dihapus dari keranjang",
        });
    };

    const handleClearCart = () => {
        if (!confirm('Kosongkan semua produk dari keranjang?')) return;

        clearCart();
        toast({
            title: "Berhasil",
            description: "Keranjang dikosongkan",
        });
    };

    const isEmpty = items.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Keranjang Belanja - Marketplace UMKM"
                description="Kelola keranjang belanja Anda"
            />
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Keranjang Belanja</h1>
                    {!isEmpty && (
                        <p className="text-muted-foreground">
                            {itemCount} produk dalam keranjang Anda
                        </p>
                    )}
                </div>

                {isEmpty ? (
                    /* Empty State */
                    <Card className="border-2 border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingCart className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Keranjang Anda Kosong</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Belum ada produk di keranjang. Yuk, mulai belanja produk UMKM unggulan!
                            </p>
                            <Button size="lg" asChild>
                                <Link to="/marketplace">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Mulai Belanja
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Produk ({items.length})</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearCart}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Kosongkan Keranjang
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {items.map((item, index) => (
                                        <div key={item.id}>
                                            <div className="p-6">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <Link
                                                        to={`/marketplace/products/${item.slug}`}
                                                        className="flex-shrink-0"
                                                    >
                                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                                                            <img
                                                                src={item.image || '/api/placeholder/96/96'}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    </Link>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            to={`/marketplace/products/${item.slug}`}
                                                            className="font-semibold text-lg hover:text-primary mb-1 block line-clamp-2"
                                                        >
                                                            {item.title}
                                                        </Link>

                                                        {/* Price */}
                                                        <p className="text-xl font-bold text-primary mb-4">
                                                            Rp {item.price.toLocaleString('id-ID')}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            <div className="flex items-center gap-2 border rounded-lg p-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <span className="w-12 text-center font-semibold">
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.stock}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveItem(item.productId)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Hapus
                                                            </Button>
                                                        </div>

                                                        {/* Stock Warning */}
                                                        {item.stock < 10 && (
                                                            <p className="text-sm text-orange-600 mt-2">
                                                                Stok terbatas: {item.stock} tersisa
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Subtotal */}
                                                    <div className="text-right hidden md:block">
                                                        <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                                                        <p className="font-bold text-xl">
                                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {index < items.length - 1 && <Separator />}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Continue Shopping Button */}
                            <Button variant="outline" size="lg" asChild className="w-full">
                                <Link to="/marketplace">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Lanjut Belanja
                                </Link>
                            </Button>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Summary Details */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal ({itemCount} produk)
                                            </span>
                                            <span className="font-medium">
                                                Rp {total.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Ongkos Kirim</span>
                                            <span className="text-sm text-green-600 font-medium">
                                                Dihitung saat checkout
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary">
                                                Rp {total.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <Button className="w-full" size="lg" asChild>
                                        <Link to="/marketplace/checkout">
                                            Lanjut ke Pembayaran
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Link>
                                    </Button>

                                    {/* Info */}
                                    <div className="bg-muted p-4 rounded-lg">
                                        <div className="flex gap-3">
                                            <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium mb-1">Gratis Ongkir</p>
                                                <p className="text-muted-foreground">
                                                    Untuk pembelian minimal Rp 100.000
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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

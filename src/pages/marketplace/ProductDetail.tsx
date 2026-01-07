import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceService, type Product } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Share2, Star, MapPin, Store, Truck, Shield, ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import SEOHead from '@/components/ui/seo-head';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);

    const reviewsData = [
        { name: "Budi Santoso", rating: 5, date: "2 hari yang lalu", comment: "Barangnya sangat bagus, pengiriman cepat dan packing rapi. Sangat merekomendasikan produk ini!" },
        { name: "Siti Aminah", rating: 4, date: "1 minggu yang lalu", comment: "Kualitas sesuai harga, admin sangat responsif saat ditanya-tanya." },
        { name: "Andi Wijaya", rating: 5, date: "2 minggu yang lalu", comment: "Luar biasa! Benar-benar produk UMKM berkualitas tinggi." }
    ];

    const averageRating = (reviewsData.reduce((acc, rev) => acc + rev.rating, 0) / reviewsData.length).toFixed(1);

    useEffect(() => {
        loadProduct();
    }, [slug]);

    const loadProduct = async () => {
        if (!slug) return;
        try {
            setLoading(true);
            const data = await marketplaceService.getProductBySlug(slug);
            if (data) {
                setProduct(data);
            } else {
                navigate('/marketplace');
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);

            // Add to cart with quantity
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }

            toast({
                title: "Berhasil!",
                description: `${quantity} ${product.name} ditambahkan ke keranjang`,
            });

            // Reset quantity
            setQuantity(1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast({
                title: "Gagal",
                description: "Gagal menambahkan produk ke keranjang",
                variant: "destructive",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);

            // Add to cart with quantity
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }

            // Navigate to cart
            navigate('/marketplace/cart');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast({
                title: "Gagal",
                description: "Gagal menambahkan produk ke keranjang",
                variant: "destructive",
            });
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title={`${product.name} - Marketplace UMKM`}
                description={product.description}
            />
            <Navigation />

            <div className="max-w-[1440px] mx-auto px-4 md:px-10 pt-24 pb-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/marketplace')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Marketplace
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] mb-12">
                    {/* Left Column (5/12) - Images & Store Info */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Photo Display */}
                        <div className="rounded-lg overflow-hidden border bg-muted/20">
                            <div className="aspect-[4/3] md:aspect-square w-full relative">
                                <img
                                    src={typeof images[selectedImage] === 'string'
                                        ? images[selectedImage]
                                        : (images[selectedImage] as any)?.url || images[selectedImage]}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-3">
                            {images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/50'
                                        }`}
                                >
                                    <img
                                        src={typeof img === 'string' ? img : (img as any)?.thumbnail || (img as any)?.url || img}
                                        alt={`${product.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Share and Like Row (Matches Image 2) */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="flex-1 h-12 gap-2 text-sm">
                                <Share2 className="h-5 w-5" /> Share button
                            </Button>
                            <Button variant="outline" className="flex-1 h-12 gap-2 text-sm">
                                <Heart className="h-5 w-5" /> Like button
                            </Button>
                        </div>

                        {/* Store Info (Matches Image 2) */}
                        <Card className="border-none bg-muted/10">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Keterangan toko</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Store className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{product.seller}</p>
                                        <p className="text-sm text-muted-foreground">{product.location}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (7/12) - Product Info */}
                    <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-2xl border shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
                                <div className="flex items-center gap-4 text-sm mb-6">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold">{averageRating}</span>
                                        <span className="text-muted-foreground">({reviewsData.length} reviews)</span>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                        {product.category}
                                    </Badge>
                                </div>
                            </div>

                            <div className="py-6 border-y border-dashed">
                                <div className="text-4xl font-bold text-primary mb-2">{product.price}</div>
                                {product.originalPrice && (
                                    <div className="text-lg text-muted-foreground line-through opacity-50">{product.originalPrice}</div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium">Stock: <span className="text-primary">{product.stock} units</span> available</p>

                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-bold">Quantity:</span>
                                    <div className="flex items-center p-1 bg-muted/30 rounded-lg">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center font-bold">{quantity}</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9"
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button
                                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                >
                                    <ShoppingCart className="h-5 w-5 mr-3" />
                                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                                </Button>
                                <Button
                                    className="flex-1 h-14 text-lg font-bold"
                                    variant="secondary"
                                    onClick={handleBuyNow}
                                    disabled={addingToCart || product.stock === 0}
                                >
                                    Buy Now
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/10">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <div className="text-xs">
                                        <p className="font-bold">Gratis Ongkir</p>
                                        <p className="text-muted-foreground">Minimal belanja Rp 100k</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/10">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <div className="text-xs">
                                        <p className="font-bold">Originalitas Terjamin</p>
                                        <p className="text-muted-foreground">100% Produk UMKM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Description and Reviews (Matches Image 3) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] mb-8">
                    <div className="lg:col-span-12">
                        <Card className="border shadow-sm">
                            <CardContent className="p-8 md:p-12">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-primary rounded-full"></span>
                                    Produk Description and Review
                                </h2>
                                <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap mb-12">
                                    {product.description}
                                </div>

                                <div className="border-t pt-10">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        Ulasan Pelanggan ({reviewsData.length})
                                    </h3>

                                    <div className="space-y-8">
                                        {reviewsData.map((review, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 font-bold text-muted-foreground">
                                                    {review.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-semibold text-sm">{review.name}</h4>
                                                        <span className="text-xs text-muted-foreground">{review.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 mb-2">
                                                        {[...Array(5)].map((_, starIdx) => (
                                                            <Star
                                                                key={starIdx}
                                                                className={`h-3 w-3 ${starIdx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                                        "{review.comment}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="ghost" className="mt-8 w-full text-primary hover:text-primary/80">
                                        Lihat semua ulasan ({reviewsData.length})
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Free Shipping</h3>
                            <p className="text-sm text-muted-foreground">For orders over Rp 100,000</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Secure Payment</h3>
                            <p className="text-sm text-muted-foreground">100% secure transaction</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Store className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Verified Seller</h3>
                            <p className="text-sm text-muted-foreground">UMKM binaan Semindo</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { marketplaceService, type Product } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Share2, Star, MapPin, Store, Truck, Shield, ArrowLeft, Plus, Minus, Loader2, Tag } from 'lucide-react';
import SEOHead from '@/components/ui/seo-head';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/core/auth/hooks/useAuth';

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedColor, setSelectedColor] = useState("Snow White");
    const [selectedStorage, setSelectedStorage] = useState("256GB");
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y });
    };

    const colors = [
        { name: "Snow White", hex: "#FFFFFF" },
        { name: "Kaamos Black", hex: "#1A1A1A" },
        { name: "The Orange", hex: "#FF6B00" }
    ];

    const storages = ["128GB", "256GB", "512GB"];

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

        // Auth Protection
        if (!user) {
            toast({
                title: "Login Diperlukan",
                description: "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang",
                variant: "destructive",
            });
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

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

        // Auth Protection
        if (!user) {
            toast({
                title: "Login Diperlukan",
                description: "Silakan login terlebih dahulu untuk melakukan pembelian",
                variant: "destructive",
            });
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

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
                        <div
                            className="rounded-lg overflow-hidden border bg-muted/20 relative group cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsZooming(true)}
                            onMouseLeave={() => setIsZooming(false)}
                        >
                            <div className="aspect-[4/3] md:aspect-square w-full relative overflow-hidden">
                                <img
                                    src={typeof images[selectedImage] === 'string'
                                        ? images[selectedImage]
                                        : (images[selectedImage] as any)?.url || images[selectedImage]}
                                    alt={product.name}
                                    style={isZooming ? {
                                        transform: `scale(2)`,
                                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                                    } : {}}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200"
                                />
                                {/* Hero Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 shadow-lg">
                                        SUPER STAR
                                    </Badge>
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 shadow-lg">
                                        PILIHAN UMKM
                                    </Badge>
                                    <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 shadow-lg animate-pulse">
                                        FLASH SALE
                                    </Badge>
                                </div>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur shadow-xl font-bold">
                                        Klik untuk Zoom
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3">
                            {images.map((img, idx) => (
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
                                    {idx === 1 && ( // Dummy video indicator on the second image
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-primary border-b-[5px] border-b-transparent ml-1" />
                                            </div>
                                        </div>
                                    )}
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
                                        <span className="font-bold text-base">{averageRating}</span>
                                        <span className="text-muted-foreground">({reviewsData.length} ulasan)</span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-border mx-2" />
                                    <div className="text-sm">
                                        <span className="font-bold">10RB+</span>
                                        <span className="text-muted-foreground ml-1">Terjual</span>
                                    </div>
                                    <div className="h-4 w-[1px] bg-border mx-2" />
                                    <div className="text-sm">
                                        <Heart className="h-3.5 w-3.5 inline mr-1 fill-rose-500 text-rose-500" />
                                        <span className="font-bold">1.2RB</span>
                                        <span className="text-muted-foreground ml-1">Favorit</span>
                                    </div>
                                    <div className="ml-auto">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            {product.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="py-8 border-y border-dashed bg-muted/5 -mx-6 md:-mx-10 px-6 md:px-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="text-4xl md:text-5xl font-extrabold text-primary">
                                        {selectedStorage === "512GB" ? "Rp 9.499.000" : selectedStorage === "128GB" ? "Rp 7.499.000" : product.price}
                                    </div>
                                    {product.originalPrice && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl text-muted-foreground line-through opacity-40">{product.originalPrice}</span>
                                            <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none text-xs font-bold">
                                                -25%
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                {product.originalPrice && (
                                    <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold">
                                        <Tag className="h-3 w-3" />
                                        <span>Promo UMKM Sinergi</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 pt-2">
                                {/* Color Selector */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        Warna: <span className="text-foreground">{selectedColor}</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {colors.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor(color.name)}
                                                className={`group relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${selectedColor === color.name
                                                    ? 'border-primary ring-2 ring-primary/20 scale-110'
                                                    : 'border-transparent hover:border-muted-foreground/30'
                                                    }`}
                                                title={color.name}
                                            >
                                                <span
                                                    className="w-10 h-10 rounded-full border shadow-inner"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                {selectedColor === color.name && (
                                                    <span className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full ring-2 ring-white">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Storage Selector */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        Penyimpanan: <span className="text-foreground">{selectedStorage}</span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {storages.map((storage) => (
                                            <Button
                                                key={storage}
                                                variant={selectedStorage === storage ? "default" : "outline"}
                                                onClick={() => setSelectedStorage(storage)}
                                                className={`h-11 px-6 rounded-xl font-semibold transition-all duration-300 ${selectedStorage === storage
                                                    ? 'shadow-md shadow-primary/10'
                                                    : 'hover:border-primary/50'
                                                    }`}
                                            >
                                                {storage}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[1px] bg-border/50 w-full" />

                                <div className="space-y-4 pt-2">
                                    <p className="text-sm font-medium text-muted-foreground">Stok Tersedia: <span className="text-primary font-extrabold">{product.stock} unit</span></p>

                                    <div className="flex items-center gap-6">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Jumlah:</span>
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
                                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
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
                                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                                            <Tag className="h-3.5 w-3.5" />
                                            <span className="text-[11px] font-bold">Min. Pembelian 5 unit</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information (Phase 3) */}
                            <div className="space-y-4 pt-6 border-t border-dashed">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Informasi Pengiriman</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-dashed transition-hover hover:bg-muted/10">
                                        <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold flex items-center gap-2">
                                                Estimasi Tiba
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700 hover:bg-green-100">Cepat</Badge>
                                            </p>
                                            <p className="text-muted-foreground">8 - 10 Januari (2-3 hari)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/5 border border-dashed transition-hover hover:bg-muted/10">
                                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold">Dikirim Dari</p>
                                            <p className="text-muted-foreground">{product.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Ongkos Kirim: <span className="font-bold">Rp 15.000 - Rp 25.000</span></span>
                                    </div>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-primary font-bold text-[11px]">Cek Detail</Button>
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
                            {/* Assurance & Trust Indicators (Phase 4) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 border-t pt-8">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Shield className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-800">Garansi Marketplace</p>
                                        <p className="text-[10px] text-green-700/80">Terima pesanan atau uang kembali</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-800">Bebas Pengembalian</p>
                                        <p className="text-[10px] text-blue-700/80">Jika barang tidak sesuai deskripsi</p>
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

                                    {reviewsData.length > 0 ? (
                                        <div className="space-y-8">
                                            {reviewsData.map((review, i) => (
                                                <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                                {review.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm">{review.name}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, starIdx) => (
                                                                            <Star
                                                                                key={starIdx}
                                                                                className={`w-3 h-3 ${starIdx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground">{review.date}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                                                            <Share2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed pl-[52px]">
                                                        {review.comment}
                                                    </p>

                                                    {i === 0 && ( // Add dummy UGC photos to the first review
                                                        <div className="flex gap-2 mt-3 pl-[52px]">
                                                            <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted/20">
                                                                <img
                                                                    src={typeof images[0] === 'string' ? images[0] : (images[0] as any)?.url}
                                                                    alt="Review visual"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted/20 relative cursor-pointer group">
                                                                <img
                                                                    src={typeof images[1] === 'string' ? images[1] : (images[1] as any)?.url || (typeof images[0] === 'string' ? images[0] : (images[0] as any)?.url)}
                                                                    alt="Review visual"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-white text-[10px] font-bold">Zoom</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center">
                                            <div className="flex justify-center gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-6 h-6 text-gray-200" />
                                                ))}
                                            </div>
                                            <h4 className="text-lg font-bold mb-1">Belum ada ulasan</h4>
                                            <p className="text-muted-foreground text-sm">Jadilah pembeli pertama yang memberikan ulasan untuk produk ini.</p>
                                        </div>
                                    )}

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

            {/* Sticky Mobile CTA (Phase 5) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0 border-2"
                >
                    <Share2 className="h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 h-12 font-bold border-2"
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    +Keranjang
                </Button>
                <Button
                    className="flex-1 h-12 font-bold bg-primary hover:bg-primary/90"
                    onClick={handleBuyNow}
                    disabled={addingToCart || product.stock === 0}
                >
                    Beli Sekarang
                </Button>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { marketplaceService, type Product } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Share2, Star, MapPin, Store, Minus, Plus, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/ui/seo-head';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

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
    const [api, setApi] = useState<CarouselApi>();
    const [addingToCart, setAddingToCart] = useState(false);

    // Mock variants for demo
    const [selectedColor, setSelectedColor] = useState("Snow White");
    const [selectedStorage, setSelectedStorage] = useState("256GB");

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

    useEffect(() => {
        if (!api) {
            return;
        }

        api.on("select", () => {
            setSelectedImage(api.selectedScrollSnap());
        });
    }, [api]);

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
                <Button disabled variant="ghost"><span className="animate-spin mr-2">⏳</span> Loading...</Button>
            </div>
        );
    }

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    // Determine current price based on selection (mock logic)
    const currentPrice = selectedStorage === "512GB" ? "Rp 9.499.000" : selectedStorage === "128GB" ? "Rp 7.499.000" : product.price;

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title={`${product.name} - Marketplace UMKM`}
                description={product.description}
            />
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>

                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-muted-foreground mb-8">
                    <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-foreground">{product.category}</span>
                    <span className="mx-2">/</span>
                    <span className="truncate max-w-[200px]">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Gallery, Actions, Store */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 1. Display Foto Produk */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-muted rounded-xl overflow-hidden border relative group">
                                <Carousel setApi={setApi} className="w-full h-full">
                                    <CarouselContent>
                                        {images.map((img, idx) => (
                                            <CarouselItem key={idx}>
                                                <div className="aspect-square w-full h-full flex items-center justify-center bg-white dark:bg-zinc-900">
                                                    <img
                                                        src={typeof img === 'string' ? img : (img as any)?.url}
                                                        alt={`${product.name} - View ${idx + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {images.length > 1 && (
                                        <>
                                            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </Carousel>
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => api?.scrollTo(idx)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-slate-300'
                                                }`}
                                        >
                                            <img
                                                src={typeof img === 'string' ? img : (img as any)?.url}
                                                alt={`Thumbnail ${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Share & Like Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full gap-2">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                                <Heart className="h-4 w-4" />
                                Favorit
                            </Button>
                        </div>

                        {/* 3. Keterangan Toko */}
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                    <Store className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate">{product.seller}</h4>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                        <span className="truncate">{product.location}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 shrink-0">Buka Toko</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Product Information */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center text-yellow-500">
                                    <Star className="fill-current h-4 w-4 mr-1" />
                                    <span className="font-medium text-foreground">{averageRating}</span>
                                </div>
                                <span>|</span>
                                <span>{reviewsData.length} Ulasan</span>
                                <span>|</span>
                                <span>{product.stock} Stok Tersedia</span>
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-primary">
                            {currentPrice}
                        </div>

                        <Separator />

                        {/* Variants */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <span className="text-sm font-medium">Warna: {selectedColor}</span>
                                <div className="flex gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-slate-300'
                                                }`}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full border border-black/10"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-sm font-medium">Kapasitas: {selectedStorage}</span>
                                <div className="flex flex-wrap gap-2">
                                    {storages.map((storage) => (
                                        <button
                                            key={storage}
                                            onClick={() => setSelectedStorage(storage)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedStorage === storage
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-input hover:border-slate-400'
                                                }`}
                                        >
                                            {storage}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-sm font-medium">Kuantitas</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Tersisa {product.stock} buah</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Actions */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 border-primary text-primary hover:bg-primary/5"
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                            >
                                + Keranjang
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleBuyNow}
                                disabled={addingToCart || product.stock === 0}
                            >
                                Beli Sekarang
                            </Button>
                        </div>

                        {/* Tabs moved out of here */}
                    </div>
                </div>

                {/* Bottom Section: Description & Reviews + Trust Features */}
                <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="border-slate-200 dark:border-zinc-800 shadow-sm">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deskripsi & Ulasan Produk</h2>
                            </div>

                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-6">
                                    <TabsTrigger
                                        value="description"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent pb-3 px-0 font-bold text-base text-muted-foreground"
                                    >
                                        Deskripsi
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="reviews"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent pb-3 px-0 font-bold text-base text-muted-foreground"
                                    >
                                        Ulasan ({reviewsData.length})
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="description">
                                    <div className="prose max-w-none text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        <p className="whitespace-pre-line">{product.description}</p>
                                    </div>

                                    {/* Additional Specs Mockup based on image */}
                                    <div className="mt-8 space-y-2">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Spesifikasi Singkat</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-slate-600 dark:text-zinc-400">
                                            <div className="flex gap-2">
                                                <span className="min-w-[100px] text-muted-foreground">Kategori:</span>
                                                <span className="font-medium">{product.category}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="min-w-[100px] text-muted-foreground">Berat:</span>
                                                <span className="font-medium">250g (Estimasi)</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="min-w-[100px] text-muted-foreground">Kondisi:</span>
                                                <span className="font-medium">Baru</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="reviews">
                                    <div className="space-y-6 pt-2">
                                        {reviewsData.map((review, i) => (
                                            <div key={i} className="border-b border-slate-100 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                                            {review.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">{review.name}</div>
                                                            <div className="text-xs text-muted-foreground">{review.date}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(5)].map((_, s) => (
                                                            <Star
                                                                key={s}
                                                                className={`h-4 w-4 ${s < review.rating ? 'fill-current' : 'text-slate-200 dark:text-zinc-700'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed pl-11">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Trust Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Free Shipping", desc: "For orders over Rp 100,000", icon: "Truck" },
                            { title: "Secure Payment", desc: "100% secure transaction", icon: "Shield" },
                            { title: "Verified Seller", desc: "UMKM binaan Semindo", icon: "Store" }
                        ].map((item, i) => (
                            <Card key={i} className="border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                    {item.icon === "Truck" && <div className="text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" /><path d="M14 17h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg></div>}
                                    {item.icon === "Shield" && <div className="text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>}
                                    {item.icon === "Store" && <div className="text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg></div>}

                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

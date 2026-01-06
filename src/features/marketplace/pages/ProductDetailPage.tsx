import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { marketplaceService } from "@/services/marketplaceService";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, ShoppingCart, Heart, Share2, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ProductDetailPage() {
    const { slug } = useParams();

    const { data: product, isLoading } = useQuery({
        queryKey: ["product", slug],
        queryFn: () => marketplaceService.getProductBySlug(slug || ""),
        enabled: !!slug,
    });

    const handleAddToCart = () => {
        if (!product) return;

        const storedCart = localStorage.getItem('marketplace_cart');
        let cartItems = storedCart ? JSON.parse(storedCart) : [];

        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id);

        if (existingItemIndex >= 0) {
            cartItems[existingItemIndex].quantity += 1;
        } else {
            cartItems.push({
                id: product.id,
                name: product.name,
                price: typeof product.price === 'string'
                    ? Number(product.price.replace(/[^0-9]/g, ''))
                    : product.price, // Already a number if came from API properly mapped
                image: product.image,
                quantity: 1,
                seller: product.seller
            });
        }

        localStorage.setItem('marketplace_cart', JSON.stringify(cartItems));
        // Dispatch event for header to update (if header listens to storage)
        window.dispatchEvent(new Event('storage'));

        toast.success("Produk berhasil ditambahkan ke keranjang!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <div className="container py-20 space-y-8">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h1>
                    <Button asChild>
                        <Link to="/marketplace">Kembali ke Marketplace</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="container py-24">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link to="/marketplace">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-xl overflow-hidden border bg-muted/20 relative shadow-inner">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {product.badges.map((badge, index) => (
                                    <Badge key={index} variant="secondary">
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{product.category}</Badge>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {product.location}
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{product.rating}</span>
                                </div>
                                <span className="text-muted-foreground">|</span>
                                <span className="text-muted-foreground">{product.reviews} Ulasan</span>
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <span className="text-4xl font-bold text-primary">{product.price}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-muted-foreground line-through mb-1">
                                    {product.originalPrice}
                                </span>
                            )}
                        </div>

                        <Separator />

                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
                            <p className="text-muted-foreground">{product.description}</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex gap-4">
                                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Tambah ke Keranjang
                                </Button>
                                <Button size="lg" variant="outline" className="px-4">
                                    <Heart className="w-5 h-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="px-4">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <Card className="bg-muted/30">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Jaminan Kualitas</div>
                                        <div className="text-sm text-muted-foreground">Produk terverifikasi & asli</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Truck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Pengiriman Aman</div>
                                        <div className="text-sm text-muted-foreground">Packing standar ekspor</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-slate-200 rounded-full" />
                            <div>
                                <div className="font-semibold">{product.seller}</div>
                                <div className="text-sm text-muted-foreground">Penjual Terpercaya</div>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto">
                                Kunjungi Toko
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

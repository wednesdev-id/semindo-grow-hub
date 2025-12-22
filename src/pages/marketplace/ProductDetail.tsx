import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceService, type Product } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Share2, Star, MapPin, Store, Truck, Shield, ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);

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
        if (!user) {
            alert('Please login to add items to cart');
            navigate('/auth/login');
            return;
        }

        if (!product) return;

        try {
            setAddingToCart(true);
            await marketplaceService.addToCart(product.id, quantity);
            alert('Product added to cart!');
            navigate('/marketplace/cart');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            alert('Please login to purchase');
            navigate('/auth/login');
            return;
        }

        if (!product) return;

        try {
            setAddingToCart(true);
            await marketplaceService.addToCart(product.id, quantity);
            navigate('/marketplace/checkout');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to proceed to checkout');
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

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/marketplace')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Marketplace
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Images */}
                    <div>
                        <div className="mb-4 rounded-lg overflow-hidden border">
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-96 object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                                        }`}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-20 object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <Badge variant="outline" className="mb-2">{product.category}</Badge>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{product.rating || 0}</span>
                                    <span>({product.reviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{product.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-3xl font-bold text-primary mb-2">{product.price}</div>
                            {product.originalPrice && (
                                <div className="text-lg text-muted-foreground line-through">{product.originalPrice}</div>
                            )}
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Stock: {product.stock} units</p>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Quantity:</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center">{quantity}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </Button>
                            <Button
                                className="flex-1"
                                size="lg"
                                variant="secondary"
                                onClick={handleBuyNow}
                                disabled={addingToCart || product.stock === 0}
                            >
                                Buy Now
                            </Button>
                            <Button size="lg" variant="outline">
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Store className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{product.seller}</p>
                                        <p className="text-sm text-muted-foreground">{product.location}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">Visit Store</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Product Details */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">Product Description</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                    </CardContent>
                </Card>

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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService, type Product, type ProductImage } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ShoppingBag, Loader2, X, Upload, Archive, Star, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { ProductFiltersComponent, type ProductFilters } from '@/components/marketplace/ProductFilters';
import SEOHead from '@/components/ui/seo-head';
import { format } from 'date-fns';

interface Order {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    sellerSubtotal?: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
    };
    items: {
        id: string;
        quantity: number;
        product: {
            id: string;
            title: string;
            price: number;
            storeId?: string;
            sellerId?: string;
        };
    }[];
}

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    // Filters state
    const [filters, setFilters] = useState<ProductFilters>({
        search: '',
        category: null,
        minPrice: 0,
        maxPrice: 100000000,
        stockStatus: 'all',
        sortBy: 'newest',
    });
    const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);

    // Product Form State
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [productForm, setProductForm] = useState<{
        title: string;
        description: string;
        price: string;
        stock: string;
        category: string;
        images: ProductImage[];
    }>({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: []
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await marketplaceService.getCategories();
                setCategories(cats);
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        // Debounce search to prevent too many requests
        const timeoutId = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [user, activeTab, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'products') {
                const data = await marketplaceService.getMyProducts(filters);
                setProducts(data);
            } else {
                const data = await marketplaceService.getSellerOrders();
                setOrders(data as any);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openProductForm = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                title: product.name,
                description: product.description,
                price: String(product.price).replace(/[^0-9]/g, ''),
                stock: product.stock.toString(),
                category: product.category,
                images: (product.images || []).map(img =>
                    typeof img === 'string' ? { url: img, thumbnail: img } : img
                )
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                title: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                images: []
            });
        }
        setShowProductForm(true);
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productForm.title || !productForm.price || !productForm.stock) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Convert types for API and ensure images
            const submissionData = {
                ...productForm,
                price: parseFloat(productForm.price) || 0,
                stock: parseInt(productForm.stock) || 0,
                images: productForm.images.length > 0
                    ? productForm.images
                    : [{ url: '/api/placeholder/300/200', thumbnail: '/api/placeholder/300/200', isMain: true }]
            };

            if (editingProduct) {
                await marketplaceService.updateProduct(editingProduct.id, submissionData);
                toast.success('Product updated successfully!');
            } else {
                await marketplaceService.createProduct(submissionData);
                toast.success('Product created successfully!');
            }
            setShowProductForm(false);
            loadData();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await marketplaceService.deleteProduct(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await marketplaceService.updateOrderStatus(orderId, newStatus);
            loadData();
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SEOHead title="Seller Dashboard - Marketplace UMKM" description="Manage your products and orders" />
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                    {activeTab === 'products' && (
                        <Button onClick={() => openProductForm()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="products">
                            <Package className="h-4 w-4 mr-2" />
                            My Products
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Pesanan Masuk
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : products.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold mb-2">No products yet</h2>
                                    <p className="text-muted-foreground mb-6">Start adding your products to sell</p>
                                    <Button onClick={() => openProductForm()}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Product
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Card key={product.id}>
                                        <CardContent className="p-4">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                            />
                                            {/* Badge - Draft, Published, or Archived */}
                                            <div className="mb-2">
                                                <Badge
                                                    variant={
                                                        product.status === 'active' ? "default" :
                                                            product.status === 'archived' ? "destructive" :
                                                                "secondary"
                                                    }
                                                    className={
                                                        product.status === 'archived' ? "bg-orange-500 hover:bg-orange-600" : ""
                                                    }
                                                >
                                                    {product.status === 'active' ? "Published" :
                                                        product.status === 'archived' ? "Archived" :
                                                            "Draft"}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                                            <p className="text-lg font-bold text-primary mb-2">{product.price}</p>
                                            <p className="text-sm text-muted-foreground mb-4">Stock: {product.stock}</p>
                                            <div className="flex flex-col gap-2">
                                                {/* Publish/Unpublish Button */}
                                                {!product.isPublished ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={async () => {
                                                            try {
                                                                await marketplaceService.updateProduct(product.id, {
                                                                    isPublished: true,
                                                                    status: 'active'
                                                                });
                                                                alert('Product published successfully!');
                                                                loadData();
                                                            } catch (error) {
                                                                console.error('Failed to publish:', error);
                                                                alert('Failed to publish product');
                                                            }
                                                        }}
                                                    >
                                                        <Upload className="h-4 w-4 mr-1" />
                                                        Publish
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={async () => {
                                                            try {
                                                                await marketplaceService.updateProduct(product.id, {
                                                                    isPublished: false,
                                                                    status: 'draft'
                                                                });
                                                                alert('Product unpublished successfully!');
                                                                loadData();
                                                            } catch (error) {
                                                                console.error('Failed to unpublish:', error);
                                                                alert('Failed to unpublish product');
                                                            }
                                                        }}
                                                    >
                                                        <Package className="h-4 w-4 mr-1" />
                                                        Unpublish
                                                    </Button>
                                                )}
                                                {/* Archive Button (only for published/draft) */}
                                                {product.status !== 'archived' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={async () => {
                                                            try {
                                                                await marketplaceService.archiveProduct(product.id);
                                                                alert('Product archived successfully!');
                                                                loadData();
                                                            } catch (error) {
                                                                console.error('Failed to archive:', error);
                                                                alert('Failed to archive product');
                                                            }
                                                        }}
                                                    >
                                                        <Archive className="h-4 w-4 mr-1" />
                                                        Archive
                                                    </Button>
                                                )}
                                                {/* Edit and Delete Buttons */}
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openProductForm(product)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="orders">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold mb-2">Belum ada pesanan</h2>
                                    <p className="text-muted-foreground">Pesanan akan muncul di sini saat pelanggan membeli produk Anda</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold mb-1">Order #{order.id.slice(0, 8)}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Customer: {order.user?.fullName || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-primary">
                                                        Rp {(order.sellerSubtotal || order.totalAmount).toLocaleString('id-ID')}
                                                    </p>
                                                    <Badge className="mt-1">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm font-medium mb-2">Items:</p>
                                                {order.items.map((item, idx) => (
                                                    <p key={idx} className="text-sm text-muted-foreground">
                                                        {item.quantity}x {item.product.title} (Rp {Number(item.product.price).toLocaleString('id-ID')})
                                                    </p>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                {order.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                                    >
                                                        Process Order
                                                    </Button>
                                                )}
                                                {order.status === 'processing' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                                    >
                                                        Mark as Shipped
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowProductForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Product Name *</Label>
                                    <Input
                                        id="title"
                                        value={productForm.title}
                                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price (Rp) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={productForm.price}
                                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="stock">Stock *</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={productForm.stock}
                                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        placeholder="e.g., Fashion, Kuliner, Kerajinan"
                                    />
                                </div>

                                <div>
                                    <Label>Product Images</Label>

                                    {/* File Upload from Computer */}
                                    <div className="mt-2 border-2 border-dashed rounded-lg p-3 hover:border-primary transition-colors relative group">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;

                                                setSubmitting(true);
                                                try {
                                                    const uploadedImages = await marketplaceService.uploadMultipleImages(files);

                                                    const updatedImages = [...productForm.images, ...uploadedImages];

                                                    // Set first image as main if none exists
                                                    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
                                                        updatedImages[0].isMain = true;
                                                    }

                                                    setProductForm({
                                                        ...productForm,
                                                        images: updatedImages
                                                    });

                                                    toast.success(`✅ ${uploadedImages.length} image(s) uploaded!`);
                                                } catch (error) {
                                                    console.error('Upload error:', error);
                                                    toast.error('❌ Failed to upload images');
                                                } finally {
                                                    setSubmitting(false);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            disabled={submitting}
                                        />
                                        <div className="text-center py-2">
                                            <Upload className="h-6 w-6 mx-auto text-muted-foreground group-hover:text-primary mb-2" />
                                            <p className="text-xs font-medium group-hover:text-primary">
                                                {submitting ? 'Uploading...' : 'Click or drag to upload (JPG, PNG, WebP)'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* URL Input */}
                                    <p className="text-sm text-muted-foreground mt-3 mb-2">
                                        🔗 Or paste image URL and press Enter
                                    </p>
                                    <div className="relative">
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            disabled={submitting}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    const url = input.value.trim();
                                                    if (url) {
                                                        try {
                                                            setSubmitting(true);
                                                            const result = await marketplaceService.uploadFromUrl(url);
                                                            const newImage: ProductImage = {
                                                                url: result.url,
                                                                thumbnail: result.thumbnail || result.url,
                                                                isMain: productForm.images.length === 0
                                                            };
                                                            setProductForm({
                                                                ...productForm,
                                                                images: [...productForm.images, newImage]
                                                            });
                                                            input.value = '';
                                                        } catch (err) {
                                                            console.error('Failed to process image URL:', err);
                                                            alert('Failed to process image URL. It might be blocked or invalid.');
                                                        } finally {
                                                            setSubmitting(false);
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        {submitting && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mt-3">
                                        {productForm.images.map((img, idx) => (
                                            <div key={idx} className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${img.isMain ? 'border-primary shadow-md' : 'border-muted hover:border-primary/50'}`}>
                                                <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />

                                                {img.isMain && (
                                                    <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                                        <Check className="h-2 w-2" /> Utama
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                                    {!img.isMain && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full"
                                                            onClick={() => {
                                                                const updated = productForm.images.map((im, i) => ({
                                                                    ...im,
                                                                    isMain: i === idx
                                                                }));
                                                                setProductForm({ ...productForm, images: updated });
                                                            }}
                                                        >
                                                            <Star className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-full"
                                                        onClick={() => {
                                                            const updated = productForm.images.filter((_, i) => i !== idx);
                                                            // If we removed the main image, make the first remaining one main
                                                            if (img.isMain && updated.length > 0) {
                                                                updated[0].isMain = true;
                                                            }
                                                            setProductForm({ ...productForm, images: updated });
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {img.metadata && (
                                                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] px-1 rounded">
                                                        {(img.metadata.size / 1024).toFixed(0)} KB
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={submitting} className="flex-1">
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Product'
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowProductForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Footer />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService, type Product } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ShoppingBag, Loader2, X, Upload } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';
import { format } from 'date-fns';

interface Order {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    user: { fullName: string };
    items: {
        id: string;
        quantity: number;
        product: { title: string };
    }[];
}

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    // Product Form State
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [productForm, setProductForm] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: [] as string[]
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadData();
    }, [user, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'products') {
                const data = await marketplaceService.getMyProducts();
                setProducts(data);
            } else {
                const data = await marketplaceService.getAllOrders();
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
                price: product.price.replace(/[^0-9]/g, ''),
                stock: product.stock.toString(),
                category: product.category,
                images: product.images || []
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

            const payload = {
                title: productForm.title,
                description: productForm.description,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock),
                category: productForm.category,
                images: productForm.images.length > 0 ? productForm.images : ['/api/placeholder/300/200']
            };

            await marketplaceService.createProduct(payload);
            alert('Product saved successfully!');
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
                            Orders
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
                                            <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                                            <p className="text-lg font-bold text-primary mb-2">{product.price}</p>
                                            <p className="text-sm text-muted-foreground mb-4">Stock: {product.stock}</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openProductForm(product)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
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
                                    <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                                    <p className="text-muted-foreground">Orders will appear here when customers buy your products</p>
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
                                                        Rp {order.totalAmount.toLocaleString('id-ID')}
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
                                                        {item.quantity}x {item.product.title}
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
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Image URLs (for MVP, use placeholder or external URLs)
                                    </p>
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                if (input.value) {
                                                    setProductForm({
                                                        ...productForm,
                                                        images: [...productForm.images, input.value]
                                                    });
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {productForm.images.map((img, idx) => (
                                            <Badge key={idx} variant="secondary">
                                                Image {idx + 1}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProductForm({
                                                            ...productForm,
                                                            images: productForm.images.filter((_, i) => i !== idx)
                                                        });
                                                    }}
                                                    className="ml-2"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowProductForm(false)}
                                    >
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

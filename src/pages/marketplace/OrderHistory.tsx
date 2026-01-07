import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import SEOHead from '@/components/ui/seo-head';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Order {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number | string;
    createdAt: string;
    courier?: string;
    trackingNumber?: string;
    items: {
        id: string;
        quantity: number;
        price: number | string;
        selectedOptions?: Record<string, string>;
        product: {
            id: string;
            title: string;
            images: string[];
        };
    }[];
}

export default function OrderHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            unpaid: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SEOHead title="Riwayat Pesanan - Marketplace UMKM" description="Lihat riwayat pesanan Anda" />
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Pesanan Saya</h1>
                    <Button variant="outline" asChild>
                        <Link to="/marketplace">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Marketplace
                        </Link>
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Belum ada pesanan</h2>
                            <p className="text-muted-foreground mb-6">Mulai belanja untuk melihat pesanan Anda di sini</p>
                            <Button asChild>
                                <Link to="/marketplace">Lihat Produk</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                        <div>
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                                                <Badge className={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Dipesan pada {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm')}
                                            </p>
                                        </div>
                                        <div className="md:text-right">
                                            <p className="text-xl font-bold text-primary">
                                                Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items.length} item
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6 pt-4 border-t">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <img
                                                    src={item.product?.images?.[0] || '/api/placeholder/60/60'}
                                                    alt={item.product?.title}
                                                    className="w-20 h-20 object-cover rounded-lg border"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-base line-clamp-1">{item.product?.title}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {item.quantity} × Rp {Number(item.price).toLocaleString('id-ID')}
                                                    </p>
                                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(order.courier || order.trackingNumber) && (
                                        <div className="bg-muted/50 p-4 rounded-lg mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-background rounded-full border">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Informasi Pengiriman</p>
                                                    <p className="text-sm font-medium">{order.courier || 'Kurir'} - {order.trackingNumber || 'No Resi tidak tersedia'}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs underline" onClick={() => toast.info('Fitur lacak paket sedang disinkronisasi.')}>
                                                Lacak Paket
                                            </Button>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                                        <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Detail Pesanan
                                        </Button>
                                        {order.status === 'delivered' && (
                                            <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                                                Beri Ulasan
                                            </Button>
                                        )}
                                        {order.paymentStatus === 'unpaid' && (
                                            <Button size="sm" className="ml-auto w-full md:w-auto">
                                                Bayar Sekarang
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div >
    );
}

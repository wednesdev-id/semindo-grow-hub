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
import { EmptyState } from '@/components/ui/empty-state';
import { ShoppingBag } from 'lucide-react';
import { OrderDetailsDialog } from '@/components/marketplace/OrderDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

    const handleOpenDetails = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDetailsOpen(true);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400',
            paid: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
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

                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto inline-flex h-12">
                        <TabsTrigger value="all" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all duration-300">Semua</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all duration-300">Berlangsung</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all duration-300">Selesai</TabsTrigger>
                    </TabsList>

                    {['all', 'active', 'completed'].map((tabValue) => {
                        const filteredOrders = orders.filter(order => {
                            // User request: Cancelled orders should disappear (restored to cart = undo)
                            if (order.status.toLowerCase() === 'cancelled') return false;

                            if (tabValue === 'all') return true;
                            if (tabValue === 'active') return ['pending', 'processing', 'shipped', 'unpaid', 'paid'].includes(order.status.toLowerCase());
                            if (tabValue === 'completed') return ['delivered', 'failed'].includes(order.status.toLowerCase());
                            return true;
                        });

                        return (
                            <TabsContent key={tabValue} value={tabValue} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {filteredOrders.length === 0 ? (
                                    <div className="py-12">
                                        <EmptyState
                                            title={tabValue === 'active' ? "Tidak ada pesanan aktif" : "Belum ada riwayat pesanan"}
                                            description="Pesanan Anda akan muncul di sini."
                                            icon={Package}
                                            action={tabValue === 'all' ? {
                                                label: "Mulai Belanja",
                                                to: "/marketplace"
                                            } : undefined}
                                            className="bg-card border-2 border-dashed rounded-xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredOrders.map((order) => (
                                            <Card key={order.id} className="overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow duration-300">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                                        <div>
                                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                                <h3 className="font-bold text-lg">Pesanan #{order.id.slice(0, 8)}</h3>
                                                                <Badge className={getStatusColor(order.status)}>
                                                                    {order.status === 'pending' ? 'Menunggu' :
                                                                        order.status === 'processing' ? 'Diproses' :
                                                                            order.status === 'shipped' ? 'Dikirim' :
                                                                                order.status === 'delivered' ? 'Selesai' :
                                                                                    order.status === 'cancelled' ? 'Dibatalkan' : order.status}
                                                                </Badge>
                                                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                                    {order.paymentStatus === 'unpaid' ? 'Belum Bayar' :
                                                                        order.paymentStatus === 'paid' ? 'Sudah Bayar' :
                                                                            order.paymentStatus === 'failed' ? 'Gagal' : order.paymentStatus}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Dipesan pada {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm')}
                                                            </p>
                                                        </div>
                                                        <div className="md:text-right">
                                                            <p className="text-2xl font-black text-primary">
                                                                Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground font-medium">
                                                                {order.items.length} item
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 mb-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex gap-4 group">
                                                                <div className="relative overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 w-16 h-16 shrink-0 shadow-sm">
                                                                    <img
                                                                        src={item.product?.images?.[0] || '/api/placeholder/64/64'}
                                                                        alt={item.product?.title}
                                                                        loading="lazy"
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                    <p className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{item.product?.title}</p>
                                                                    <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                                                                        {item.quantity} × Rp {Number(item.price).toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {(order.courier || order.trackingNumber) && (
                                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-100 dark:border-zinc-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 shadow-sm text-primary">
                                                                    <Package className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Informasi Pengiriman</p>
                                                                    <p className="text-sm font-bold">{order.courier || 'Kurir'} - <span className="text-primary">{order.trackingNumber || 'No Resi tidak tersedia'}</span></p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold underline hover:bg-transparent hover:text-primary transition-colors" onClick={() => toast.info('Fitur lacak paket sedang disinkronisasi.')}>
                                                                Lacak Paket
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 md:flex-none font-bold"
                                                            onClick={() => handleOpenDetails(order.id)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Detail Pesanan
                                                        </Button>
                                                        {order.status === 'delivered' && (
                                                            <Button variant="outline" size="sm" className="flex-1 md:flex-none font-bold">
                                                                Beri Ulasan
                                                            </Button>
                                                        )}
                                                        {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
                                                            <Button size="sm" className="ml-auto w-full md:w-auto font-bold px-8 shadow-lg shadow-primary/20">
                                                                Bayar Sekarang
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>

            <OrderDetailsDialog
                orderId={selectedOrderId}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                onOrderUpdated={loadOrders}
            />

            <Footer />
        </div >
    );
}


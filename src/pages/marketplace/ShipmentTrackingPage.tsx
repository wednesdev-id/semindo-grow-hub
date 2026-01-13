import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, PackageSearch, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackingTimeline, TrackingStatus } from '@/components/marketplace/tracking/TrackingTimeline';
import { TrackingMap } from '@/components/marketplace/tracking/TrackingMap';
import { Separator } from "@/components/ui/separator";
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { marketplaceService, Order } from '@/services/marketplaceService';
import { toast } from 'sonner';

const ShipmentTrackingPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Status progression mapping
    const statusFlow: TrackingStatus[] = ['processed', 'packed', 'shipped', 'in_transit', 'near_destination', 'delivered'];

    const getProgressForStatus = (s: TrackingStatus): number => {
        switch (s) {
            case 'processed': return 0;
            case 'packed': return 5;
            case 'shipped': return 20;
            case 'in_transit': return 50;
            case 'near_destination': return 85;
            case 'delivered': return 100;
            default: return 0;
        }
    };

    const currentStatus = (order?.status === 'delivered' ? 'delivered' : (order as any)?.shipmentStatus || 'processed') as TrackingStatus;
    const progress = getProgressForStatus(currentStatus);

    useEffect(() => {
        if (orderId) loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getOrderDetails(orderId!);
            setOrder(data);
        } catch (error) {
            console.error("Failed to load order:", error);
            toast.error("Gagal memuat data pengiriman");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: TrackingStatus) => {
        if (!orderId) return;
        try {
            setUpdating(true);
            // Assuming this method exists in marketplaceService as per previous steps
            await marketplaceService.updateShipmentStatus(orderId, newStatus);
            await loadOrder(); // Refresh data
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Gagal update status');
        } finally {
            setUpdating(false);
        }
    };

    const getNextStatus = (current: TrackingStatus): TrackingStatus | null => {
        const idx = statusFlow.indexOf(current);
        if (idx < statusFlow.length - 1) return statusFlow[idx + 1];
        return null;
    };

    const handleSimulateNext = () => {
        const next = getNextStatus(currentStatus);
        if (next) updateStatus(next);
    };

    const handleSimulatePrev = () => {
        const idx = statusFlow.indexOf(currentStatus);
        if (idx > 0) {
            const prev = statusFlow[idx - 1];
            updateStatus(prev);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Pesanan
                </Button>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Lacak Pengiriman</h1>
                        <p className="text-muted-foreground text-sm">Order ID: #{orderId?.slice(0, 8)}</p>
                    </div>
                    <Button variant="outline" size="icon" title="Cara kerja pelacakan">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                </div>

                {/* Disclaimer Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex gap-3 text-blue-700 text-sm">
                    <div className="mt-0.5"><PackageSearch className="w-4 h-4" /></div>
                    <p>
                        <strong>Info Pelacakan:</strong> Lokasi kurir pada peta bersifat estimasi dan diperbarui secara berkala.
                        Mohon menunggu update status selanjutnya.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                    {/* Left Col: Map & Status */}
                    <div className="space-y-6">
                        {/* Map Preview */}
                        <Card>
                            <CardContent className="p-0 pt-0 overflow-hidden rounded-lg">
                                <TrackingMap progress={progress} />
                                <div className="p-4 bg-white">
                                    <h3 className="font-semibold mb-1">
                                        {currentStatus === 'delivered' ? 'Pesanan Telah Tiba' :
                                            currentStatus === 'near_destination' ? 'Kurir Mendekati Lokasi' :
                                                currentStatus === 'in_transit' ? 'Sedang Dalam Perjalanan' :
                                                    'Menunggu Update Kurir'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {currentStatus === 'delivered' ? 'Paket sudah diterima.' :
                                            'Estimasi tiba hari ini sebelum jam 18:00'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Simulator Controls (Dev Only / Prototype) */}
                        <Card className="border-dashed border-yellow-300 bg-yellow-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-yellow-800">
                                    🛠️ Prototype Simulator
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleSimulatePrev} disabled={updating || currentStatus === 'processed'}>
                                    Previous Step
                                </Button>
                                <Button size="sm" onClick={handleSimulateNext} disabled={updating || currentStatus === 'delivered'}>
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Advance Status'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Timeline */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-base">Status Pengiriman</CardTitle>
                            <CardDescription>Update terkini dari kurir</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrackingTimeline currentStatus={currentStatus} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ShipmentTrackingPage;

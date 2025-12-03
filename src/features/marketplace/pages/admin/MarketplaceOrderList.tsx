import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Truck } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MarketplaceOrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courier, setCourier] = useState("");

    const fetchOrders = async () => {
        try {
            const data = await marketplaceService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        try {
            if (newStatus === "shipped") {
                if (!trackingNumber || !courier) {
                    toast.error("Mohon lengkapi data pengiriman");
                    return;
                }
                await marketplaceService.updateShipment(selectedOrder.id, trackingNumber, courier);
            } else {
                await marketplaceService.updateOrderStatus(selectedOrder.id, newStatus);
            }

            toast.success("Status pesanan berhasil diperbarui");
            setIsDialogOpen(false);
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Gagal memperbarui status pesanan");
        }
    };

    const openUpdateDialog = (order: any) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setTrackingNumber(order.trackingNumber || "");
        setCourier(order.courier || "");
        setIsDialogOpen(true);
    };

    const columns = [
        {
            header: "Order ID",
            accessorKey: "id" as const,
            className: "font-medium",
        },
        {
            header: "Customer",
            accessorKey: "customer" as const,
        },
        {
            header: "Date",
            accessorKey: "date" as const,
        },
        {
            header: "Total",
            accessorKey: "total" as const,
        },
        {
            header: "Items",
            accessorKey: "items" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: any) => <StatusBadge status={item.status} />,
        },
        {
            header: "Actions",
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openUpdateDialog(item)}>
                        <Truck className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleSyncStock = async () => {
        toast.success("Stok berhasil disinkronisasi dengan Marketplace Eksternal");
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            <DashboardPageHeader
                title="Order Management"
                description="View and manage customer orders."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace/reports" },
                    { label: "Orders" },
                ]}
            />

            <div className="mb-4 flex justify-end">
                <Button onClick={handleSyncStock} variant="outline">
                    Sync Stock (External)
                </Button>
            </div>

            <DataGrid
                data={orders}
                columns={columns}
                searchKey="id"
                searchPlaceholder="Search order ID..."
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Status Pesanan</DialogTitle>
                        <DialogDescription>
                            Ubah status pesanan #{selectedOrder?.id?.substring(0, 8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newStatus === "shipped" && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Kurir</Label>
                                    <Input
                                        placeholder="Contoh: JNE, J&T"
                                        value={courier}
                                        onChange={(e) => setCourier(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nomor Resi</Label>
                                    <Input
                                        placeholder="Masukkan nomor resi"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdateStatus}>
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

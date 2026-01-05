import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { marketplaceService } from "@/services/marketplaceService";
import { toast } from "sonner";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    Upload,
    Store,
    MapPin,
    DollarSign,
    Box,
    Eye,
    ExternalLink
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);

    const fetchProduct = async () => {
        if (!slug) return;
        try {
            setLoading(true);
            const data = await marketplaceService.getProductBySlug(slug);
            setProduct(data);
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error("Gagal memuat detail produk");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const handleDelete = async () => {
        if (!product) return;
        try {
            await marketplaceService.deleteProduct(product.id);
            toast.success("Produk berhasil dihapus");
            navigate("/marketplace/products");
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Gagal menghapus produk");
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!product) return;
        try {
            setPublishLoading(true);
            const newStatus = !product.isPublished;
            await marketplaceService.updateProduct(product.id, {
                isPublished: newStatus,
                status: newStatus ? 'active' : 'draft'
            });
            toast.success(newStatus ? "Produk berhasil dipublikasikan" : "Produk berhasil di-unpublish");
            fetchProduct();
        } catch (error) {
            console.error("Failed to toggle publish:", error);
            toast.error("Gagal mengubah status produk");
        } finally {
            setPublishLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Produk tidak ditemukan</h3>
                    <p className="text-muted-foreground mb-4">Produk yang Anda cari tidak tersedia.</p>
                    <Button onClick={() => navigate("/marketplace/products")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Daftar Produk
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <DashboardPageHeader
                title={product.name}
                description="Detail lengkap produk marketplace"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace/products" },
                    { label: "Produk UMKM", href: "/marketplace/products" },
                    { label: product.name },
                ]}
                action={{
                    label: "Kembali",
                    onClick: () => navigate("/marketplace/products"),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: "outline"
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Images */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.slice(0, 4).map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                                            <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Deskripsi Produk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {product.description || "Tidak ada deskripsi tersedia."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* External Links */}
                    {product.externalLinks && (product.externalLinks.shopee || product.externalLinks.tokopedia) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Link Marketplace Eksternal</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {product.externalLinks.shopee && (
                                    <a
                                        href={product.externalLinks.shopee}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Lihat di Shopee
                                    </a>
                                )}
                                {product.externalLinks.tokopedia && (
                                    <a
                                        href={product.externalLinks.tokopedia}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Lihat di Tokopedia
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                    {/* Product Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Produk</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Price */}
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Harga</p>
                                    <p className="font-semibold text-lg">{product.price}</p>
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="flex items-start gap-3">
                                <Box className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Stok</p>
                                    <p className="font-semibold">{product.stock} unit</p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex items-start gap-3">
                                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Kategori</p>
                                    <p className="font-semibold">{product.category}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Seller Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Penjual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Seller Name */}
                            <div className="flex items-start gap-3">
                                <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Nama Toko</p>
                                    <p className="font-semibold">{product.seller}</p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Lokasi</p>
                                    <p className="font-semibold">{product.location}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

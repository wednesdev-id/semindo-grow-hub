import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Eye } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
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

export default function MarketplaceProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            // Admin view: get ALL products from all sellers
            const data = await marketplaceService.getAllProductsForAdmin();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Gagal memuat produk");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await marketplaceService.deleteProduct(deleteId);
            toast.success("Produk berhasil dihapus");
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Gagal menghapus produk");
        } finally {
            setDeleteId(null);
        }
    };

    const columns = [
        {
            header: "Product Name",
            accessorKey: "name" as const,
            className: "font-medium",
        },
        {
            header: "Category",
            accessorKey: "category" as const,
        },
        {
            header: "Price",
            accessorKey: "price" as const,
        },
        {
            header: "Stock",
            accessorKey: "stock" as const,
        },
        {
            header: "Actions",
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/marketplace/products/${item.slug}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                    // onClick={() => navigate(`/dashboard/marketplace/products/${item.id}/edit`)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(item.id)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

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
                title="My Products"
                description="Manage your marketplace products."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Marketplace", href: "/marketplace" },
                    { label: "Products" },
                ]}
                action={{
                    label: "Add Product",
                    onClick: () => navigate("/dashboard/marketplace/products/new"),
                    icon: <Plus className="h-4 w-4 mr-2" />
                }}
            />

            <DataGrid
                data={products}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search products..."
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your product.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

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

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        status: "",
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState<any>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Admin view: get ALL products from all sellers with filters
            const { products: data, pagination: pag } = await marketplaceService.getAllProductsForAdmin(filters);
            setProducts(data);
            setPagination(pag);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Gagal memuat produk");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

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

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search products or stores..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                />

                <select
                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                >
                    <option value="">All Status</option>
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <DataGrid
                data={products}
                columns={[
                    {
                        header: "Product Name",
                        accessorKey: "name",
                        className: "font-medium",
                    },
                    {
                        header: "Seller",
                        accessorKey: "seller",
                    },
                    {
                        header: "Status",
                        accessorKey: "status",
                        cell: (item: any) => (
                            <div className={`capitalize ${item.status === 'active' ? 'text-green-600' :
                                    item.status === 'draft' ? 'text-gray-500' : 'text-red-500'
                                }`}>
                                {item.status} {!item.isPublished && item.status === 'active' ? '(Unpublished)' : ''}
                            </div>
                        )
                    },
                    {
                        header: "Category",
                        accessorKey: "category",
                    },
                    {
                        header: "Price",
                        accessorKey: "price",
                    },
                    {
                        header: "Stock",
                        accessorKey: "stock",
                    },
                    {
                        header: "Actions",
                        cell: (item: any) => (
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/marketplace/product/${item.slug}`)}
                                >
                                    <Eye className="h-4 w-4" />
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
                ]}
                searchKey="name"
                searchPlaceholder="Search products..."
                hideSearch // Hiding built-in search to use server-side search above
            />

            {/* Simple Pagination */}
            {pagination && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page <= 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

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

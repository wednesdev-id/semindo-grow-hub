import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Check, X, ExternalLink, AlertTriangle } from 'lucide-react';

export default function ProductModerationPage() {
    const queryClient = useQueryClient();
    const [statsFilter, setStatusFilter] = useState<string>('pending'); // pending, all, rejected
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState('');

    const { data: products, isLoading } = useQuery({
        queryKey: ['admin-products', statsFilter],
        queryFn: () => marketplaceService.getAdminProducts({ status: statsFilter === 'all' ? undefined : statsFilter })
    });

    const approveMutation = useMutation({
        mutationFn: marketplaceService.approveProduct,
        onSuccess: () => {
            toast.success('Product approved successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: any) => {
            toast.error(`Failed to approve: ${error.message}`);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) =>
            marketplaceService.rejectProduct(id, reason),
        onSuccess: () => {
            toast.success('Product rejected successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            setRejectDialogOpen(false);
            setRejectReason('');
            setSelectedProduct(null);
        },
        onError: (error: any) => {
            toast.error(`Failed to reject: ${error.message}`);
        }
    });

    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this product?')) {
            approveMutation.mutate(id);
        }
    };

    const handleRejectClick = (product: any) => {
        setSelectedProduct(product);
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = () => {
        if (!selectedProduct || !rejectReason.trim()) return;
        rejectMutation.mutate({ id: selectedProduct.id, reason: rejectReason });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Product Moderation</h1>
                    <p className="text-muted-foreground">Review and moderate user product listings.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statsFilter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statsFilter === 'rejected' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        Rejected
                    </Button>
                    <Button
                        variant={statsFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </Button>
                </div>
            </div>

            {isLoading ? <LoadingSpinner /> : (
                <Card>
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products && products.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Seller</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product: any) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {product.images && product.images[0] ? (
                                                        <img
                                                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                                                            alt={product.title}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                            N/A
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{product.title}</p>
                                                        <a
                                                            href={`/marketplace/product/${product.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary flex items-center hover:underline"
                                                        >
                                                            View Listing <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{product.store?.name || 'Unknown Store'}</span>
                                                    <span className="text-xs text-muted-foreground">{product.store?.user?.fullName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>Rp {Number(product.price).toLocaleString('id-ID')}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    product.status === 'active' ? 'default' :
                                                        product.status === 'pending' ? 'outline' :
                                                            product.status === 'rejected' ? 'destructive' : 'secondary'
                                                }>
                                                    {product.status}
                                                </Badge>
                                                {product.rejectionReason && (
                                                    <div className="mt-1 text-xs text-red-500 flex items-center">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        {product.rejectionReason}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {product.status !== 'rejected' && (
                                                    <div className="flex justify-end gap-2">
                                                        {product.status !== 'active' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleApprove(product.id)}
                                                                title="Approve"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleRejectClick(product)}
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No products found matching your filter.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Product: {selectedProduct?.title}</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejection. This will be sent to the seller.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection (e.g., Inappropriate content, Missing information)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { consultationService } from '@/services/consultationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Package, Clock, DollarSign } from 'lucide-react';
import type { ConsultationPackage } from '@/types/consultation';

const DURATION_OPTIONS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

export default function PackagesTab() {
    const [packages, setPackages] = useState<ConsultationPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ConsultationPackage | null>(null);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        durationMinutes: 60,
        price: 0,
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await consultationService.getPackages();
            setPackages((data as ConsultationPackage[]) || []);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load packages',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingPackage(null);
        setFormData({
            name: '',
            durationMinutes: 60,
            price: 0,
            description: '',
            isActive: true
        });
        setDialogOpen(true);
    };

    const openEditDialog = (pkg: ConsultationPackage) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            durationMinutes: pkg.durationMinutes,
            price: pkg.price,
            description: pkg.description || '',
            isActive: pkg.isActive
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price) {
            toast({
                title: 'Validation Error',
                description: 'Name and price are required',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSaving(true);
            if (editingPackage) {
                // Update existing
                await consultationService.updatePackage(editingPackage.id, formData);
                toast({ title: 'Package updated successfully' });
            } else {
                // Create new
                await consultationService.createPackage(formData);
                toast({ title: 'Package created successfully' });
            }
            setDialogOpen(false);
            fetchPackages();
        } catch (error) {
            console.error('Failed to save package:', error);
            toast({
                title: 'Error',
                description: 'Failed to save package',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            await consultationService.deletePackage(id);
            toast({ title: 'Package deleted' });
            fetchPackages();
        } catch (error) {
            console.error('Failed to delete package:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete package',
                variant: 'destructive'
            });
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = minutes / 60;
        return hours === 1 ? '1 hour' : `${hours} hours`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Consultation Packages</CardTitle>
                        <CardDescription>
                            Define different session types with custom durations and prices
                        </CardDescription>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Package
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {packages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No packages defined yet.</p>
                        <p className="text-sm">Create packages to offer different session types to your clients.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative p-4 border rounded-lg ${pkg.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold">{pkg.name}</h4>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditDialog(pkg)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDelete(pkg.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDuration(pkg.durationMinutes)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="font-medium text-foreground">
                                            {formatPrice(pkg.price)}
                                        </span>
                                    </div>
                                </div>

                                {pkg.description && (
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                        {pkg.description}
                                    </p>
                                )}

                                <div className="mt-3">
                                    {pkg.isActive ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPackage ? 'Edit Package' : 'Create Package'}
                        </DialogTitle>
                        <DialogDescription>
                            Define a consultation package with duration and pricing
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Package Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Quick Consultation, Deep Dive Session"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration *</Label>
                                <Select
                                    value={String(formData.durationMinutes)}
                                    onValueChange={(v) => setFormData({ ...formData, durationMinutes: Number(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DURATION_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (IDR) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="250000"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of what this package includes..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Active (visible to clients)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingPackage ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

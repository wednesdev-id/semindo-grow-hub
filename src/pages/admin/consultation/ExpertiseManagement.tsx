import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, RotateCcw, Users, Search } from 'lucide-react';
import { api } from '@/services/api';

interface ExpertiseCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
    categoryGroup?: string;
    isActive: boolean;
    isDeleted: boolean;
    consultantCount?: number;
    createdAt: string;
}

export default function ExpertiseManagement() {
    const { toast } = useToast();
    const [expertise, setExpertise] = useState<ExpertiseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedExpertise, setSelectedExpertise] = useState<ExpertiseCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Briefcase',
        categoryGroup: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadExpertise();
    }, [filter]);

    const loadExpertise = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (filter === 'active') params.append('isActive', 'true');
            if (filter === 'inactive') params.append('isActive', 'false');
            if (filter === 'deleted') params.append('isDeleted', 'true');

            const response = await api.get<{ success: boolean; data: ExpertiseCategory[] }>(
                `/consultation/admin/expertise?${params.toString()}`
            );

            // Handle both response formats
            const data = response.data?.data || response.data;
            setExpertise(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to load expertise:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to load expertise categories',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFormModal = (item?: ExpertiseCategory) => {
        if (item) {
            setSelectedExpertise(item);
            setFormData({
                name: item.name,
                description: item.description || '',
                icon: item.icon,
                categoryGroup: item.categoryGroup || ''
            });
        } else {
            setSelectedExpertise(null);
            setFormData({
                name: '',
                description: '',
                icon: 'Briefcase',
                categoryGroup: ''
            });
        }
        setShowFormModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            if (selectedExpertise) {
                // Update
                await api.patch(`/consultation/admin/expertise/${selectedExpertise.id}`, formData);
                toast({
                    title: 'Success',
                    description: 'Expertise category updated successfully'
                });
            } else {
                // Create
                await api.post('/consultation/admin/expertise', formData);
                toast({
                    title: 'Success',
                    description: 'Expertise category created successfully'
                });
            }

            setShowFormModal(false);
            loadExpertise();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to save expertise category',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedExpertise) return;

        try {
            setSubmitting(true);
            await api.delete(`/consultation/admin/expertise/${selectedExpertise.id}`);
            toast({
                title: 'Success',
                description: 'Expertise category deleted successfully'
            });
            setShowDeleteDialog(false);
            loadExpertise();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to delete expertise category',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestore = async (item: ExpertiseCategory) => {
        try {
            await api.post(`/consultation/admin/expertise/${item.id}/restore`);
            toast({
                title: 'Success',
                description: 'Expertise category restored successfully'
            });
            loadExpertise();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to restore expertise category',
                variant: 'destructive'
            });
        }
    };

    const filteredExpertise = expertise.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Expertise Management</h1>
                    <p className="text-muted-foreground">Manage consultation expertise categories</p>
                </div>
                <Button onClick={() => handleOpenFormModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expertise
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search expertise..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('active')}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filter === 'inactive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('inactive')}
                            >
                                Inactive
                            </Button>
                            <Button
                                variant={filter === 'deleted' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('deleted')}
                            >
                                Deleted
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : filteredExpertise.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No expertise categories found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Consultants</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpertise.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {item.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{item.consultantCount || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.isDeleted ? (
                                                <Badge variant="secondary">Deleted</Badge>
                                            ) : item.isActive ? (
                                                <Badge variant="default">Active</Badge>
                                            ) : (
                                                <Badge variant="outline">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.isDeleted ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRestore(item)}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenFormModal(item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedExpertise(item);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedExpertise ? 'Edit Expertise' : 'Add New Expertise'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedExpertise
                                ? 'Update the expertise category details'
                                : 'Create a new expertise category for consultants'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Financial Management"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this expertise area"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Input
                                        id="icon"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="Lucide icon name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoryGroup">Group</Label>
                                    <Input
                                        id="categoryGroup"
                                        value={formData.categoryGroup}
                                        onChange={(e) => setFormData({ ...formData, categoryGroup: e.target.value })}
                                        placeholder="e.g., Business"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : selectedExpertise ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expertise Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedExpertise && selectedExpertise.consultantCount! > 0 ? (
                                <>
                                    This expertise is currently used by <strong>{selectedExpertise.consultantCount} consultant(s)</strong>.
                                    Deleting will hide it from selection but won't remove it from existing consultant profiles.
                                </>
                            ) : (
                                'This expertise category will be marked as deleted and hidden from selection.'
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { permissionService, Permission, CreatePermissionData, UpdatePermissionData } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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

export default function PermissionManagement() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState<CreatePermissionData>({
        name: '',
        displayName: '',
        description: '',
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await permissionService.getAllPermissions();
            setPermissions(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load permissions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            await permissionService.createPermission(formData);
            toast({
                title: 'Success',
                description: 'Permission created successfully',
            });
            setCreateDialogOpen(false);
            setFormData({ name: '', displayName: '', description: '' });
            fetchPermissions();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create permission',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedPermission) return;

        setSubmitting(true);
        try {
            const updateData: UpdatePermissionData = {
                displayName: formData.displayName,
                description: formData.description,
            };
            await permissionService.updatePermission(selectedPermission.id, updateData);
            toast({
                title: 'Success',
                description: 'Permission updated successfully',
            });
            setEditDialogOpen(false);
            setSelectedPermission(null);
            fetchPermissions();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update permission',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPermission) return;

        setSubmitting(true);
        try {
            await permissionService.deletePermission(selectedPermission.id);
            toast({
                title: 'Success',
                description: 'Permission deleted successfully',
            });
            setDeleteDialogOpen(false);
            setSelectedPermission(null);
            fetchPermissions();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete permission',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDialog = (permission: Permission) => {
        setSelectedPermission(permission);
        setFormData({
            name: permission.name,
            displayName: permission.displayName,
            description: permission.description || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (permission: Permission) => {
        setSelectedPermission(permission);
        setDeleteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Permission Management</h1>
                    <p className="text-muted-foreground">Manage system permissions</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Permission
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>All system permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Assigned Roles</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell className="font-mono text-sm">{permission.name}</TableCell>
                                    <TableCell className="font-medium">{permission.displayName}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-xs truncate">
                                        {permission.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {permission.roles && permission.roles.length > 0 ? (
                                                permission.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary">
                                                        {role.displayName}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No roles</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(permission)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(permission)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Permission</DialogTitle>
                        <DialogDescription>
                            Create a new permission for role assignment
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Permission Name (slug)</Label>
                            <Input
                                id="name"
                                placeholder="e.g., manage_content"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use lowercase with underscores
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                placeholder="e.g., Manage Content"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what this permission allows"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Permission'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Permission</DialogTitle>
                        <DialogDescription>
                            Update permission information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Permission Name</Label>
                            <Input value={formData.name} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">
                                Permission name cannot be changed
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editDisplayName">Display Name</Label>
                            <Input
                                id="editDisplayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the permission "{selectedPermission?.displayName}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

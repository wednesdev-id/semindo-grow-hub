import { useState, useEffect } from 'react';
import { roleService, Role, CreateRoleData, UpdateRoleData } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Users, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
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

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CreateRoleData>({
        name: '',
        displayName: '',
        description: '',
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await roleService.getAllRoles();
            setRoles(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load roles',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            await roleService.createRole(formData);
            toast({
                title: 'Success',
                description: 'Role created successfully',
            });
            setCreateDialogOpen(false);
            setFormData({ name: '', displayName: '', description: '' });
            fetchRoles();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create role',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedRole) return;

        setSubmitting(true);
        try {
            const updateData: UpdateRoleData = {
                displayName: formData.displayName,
                description: formData.description,
            };
            await roleService.updateRole(selectedRole.id, updateData);
            toast({
                title: 'Success',
                description: 'Role updated successfully',
            });
            setEditDialogOpen(false);
            setSelectedRole(null);
            fetchRoles();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update role',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole) return;

        setSubmitting(true);
        try {
            await roleService.deleteRole(selectedRole.id);
            toast({
                title: 'Success',
                description: 'Role deleted successfully',
            });
            setDeleteDialogOpen(false);
            setSelectedRole(null);
            fetchRoles();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete role',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDialog = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            displayName: role.displayName,
            description: role.description || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (role: Role) => {
        setSelectedRole(role);
        setDeleteDialogOpen(true);
    };

    const isSystemRole = (roleName: string) => {
        return ['admin', 'super_admin', 'umkm', 'mentor'].includes(roleName);
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
                    <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">Manage system roles and their permissions</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>All system roles and their details</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Permissions</TableHead>
                                <TableHead className="text-center">Users</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-mono text-sm">
                                        {role.name}
                                        {isSystemRole(role.name) && (
                                            <Badge variant="secondary" className="ml-2">System</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{role.displayName}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-xs truncate">
                                        {role.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/admin/roles/${role.id}`)}
                                        >
                                            <Shield className="mr-1 h-3 w-3" />
                                            {role.permissionsCount || 0}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/admin/roles/${role.id}`)}
                                        >
                                            <Users className="mr-1 h-3 w-3" />
                                            {role.usersCount || 0}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(role)}
                                                disabled={isSystemRole(role.name)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(role)}
                                                disabled={isSystemRole(role.name)}
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
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                            Create a new role with custom permissions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name (slug)</Label>
                            <Input
                                id="name"
                                placeholder="e.g., content_manager"
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
                                placeholder="e.g., Content Manager"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the role's purpose"
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
                                'Create Role'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update role information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Role Name</Label>
                            <Input value={formData.name} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">
                                Role name cannot be changed
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
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role "{selectedRole?.displayName}"?
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleService, permissionService, Role, Permission } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Shield, Users, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function RoleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            fetchRoleDetails();
            fetchAllPermissions();
        }
    }, [id]);

    const fetchRoleDetails = async () => {
        try {
            const response = await roleService.getRoleById(id!);
            const roleData = response.data;
            setRole(roleData);

            // Set initially selected permissions
            if (roleData.permissions) {
                setSelectedPermissions(new Set(roleData.permissions.map((p: Permission) => p.id)));
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load role details',
                variant: 'destructive',
            });
            navigate('/admin/roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPermissions = async () => {
        try {
            const response = await permissionService.getAllPermissions();
            setAllPermissions(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load permissions',
                variant: 'destructive',
            });
        }
    };

    const handlePermissionToggle = (permissionId: string) => {
        const newSelected = new Set(selectedPermissions);
        if (newSelected.has(permissionId)) {
            newSelected.delete(permissionId);
        } else {
            newSelected.add(permissionId);
        }
        setSelectedPermissions(newSelected);
    };

    const handleSavePermissions = async () => {
        setSaving(true);
        try {
            await roleService.assignPermissions(id!, Array.from(selectedPermissions));
            toast({
                title: 'Success',
                description: 'Permissions updated successfully',
            });
            fetchRoleDetails();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update permissions',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!role) {
        return null;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Roles
                </Button>
            </div>

            <div>
                <h1 className="text-2xl font-bold tracking-tight">{role.displayName}</h1>
                <p className="text-muted-foreground">{role.description || 'No description'}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Role Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Role Name</Label>
                            <p className="font-mono text-sm mt-1">{role.name}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Display Name</Label>
                            <p className="font-medium mt-1">{role.displayName}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="mt-1">{role.description || '-'}</p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <strong>{role.permissions?.length || 0}</strong> permissions
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <strong>{role.users?.length || 0}</strong> users
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users with this role */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users with this Role</CardTitle>
                        <CardDescription>Users currently assigned to this role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role.users && role.users.length > 0 ? (
                            <div className="space-y-2">
                                {role.users.slice(0, 5).map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{user.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                ))}
                                {role.users.length > 5 && (
                                    <p className="text-sm text-muted-foreground pt-2">
                                        And {role.users.length - 5} more users...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No users assigned to this role</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Permission Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Manage Permissions</CardTitle>
                            <CardDescription>
                                Select permissions to assign to this role
                            </CardDescription>
                        </div>
                        <Button onClick={handleSavePermissions} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {allPermissions.map((permission) => (
                            <div
                                key={permission.id}
                                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                                onClick={() => handlePermissionToggle(permission.id)}
                            >
                                <Checkbox
                                    checked={selectedPermissions.has(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <div className="flex-1">
                                    <Label className="cursor-pointer font-medium">
                                        {permission.displayName}
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {permission.description || permission.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

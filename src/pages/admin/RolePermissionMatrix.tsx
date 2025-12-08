import { useState, useEffect } from 'react';
import { roleService, permissionService, Role, Permission } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function RolePermissionMatrix() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [matrix, setMatrix] = useState<Map<string, Set<string>>>(new Map());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                roleService.getAllRoles(),
                permissionService.getAllPermissions()
            ]);

            const rolesData = rolesRes.data;
            const permsData = permsRes.data;

            setRoles(rolesData);
            setPermissions(permsData);

            // Build matrix from role permissions
            const newMatrix = new Map<string, Set<string>>();
            rolesData.forEach((role: Role) => {
                const permSet = new Set<string>();
                if (role.permissions) {
                    role.permissions.forEach((perm: Permission) => {
                        permSet.add(perm.id);
                    });
                }
                newMatrix.set(role.id, permSet);
            });
            setMatrix(newMatrix);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (roleId: string, permissionId: string) => {
        const newMatrix = new Map(matrix);
        const rolePerms = newMatrix.get(roleId) || new Set<string>();

        if (rolePerms.has(permissionId)) {
            rolePerms.delete(permissionId);
        } else {
            rolePerms.add(permissionId);
        }

        newMatrix.set(roleId, rolePerms);
        setMatrix(newMatrix);
    };

    const hasPermission = (roleId: string, permissionId: string): boolean => {
        return matrix.get(roleId)?.has(permissionId) || false;
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // Save all role permissions
            const promises = Array.from(matrix.entries()).map(([roleId, permIds]) => {
                return roleService.assignPermissions(roleId, Array.from(permIds));
            });

            await Promise.all(promises);

            toast({
                title: 'Success',
                description: 'All permissions updated successfully',
            });

            fetchData();
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
                    <h1 className="text-2xl font-bold tracking-tight">Role-Permission Matrix</h1>
                    <p className="text-muted-foreground">Manage permissions for all roles at once</p>
                </div>
                <Button onClick={handleSaveAll} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving All...
                        </>
                    ) : (
                        'Save All Changes'
                    )}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Permission Matrix</CardTitle>
                    <CardDescription>
                        Check/uncheck boxes to assign or remove permissions from roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px] sticky left-0 bg-background z-10">
                                        Permission
                                    </TableHead>
                                    {roles.map((role) => (
                                        <TableHead key={role.id} className="text-center min-w-[120px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-medium">{role.displayName}</span>
                                                {isSystemRole(role.name) && (
                                                    <span className="text-xs text-muted-foreground">(System)</span>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell className="sticky left-0 bg-background z-10">
                                            <div>
                                                <p className="font-medium">{permission.displayName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {permission.description || permission.name}
                                                </p>
                                            </div>
                                        </TableCell>
                                        {roles.map((role) => (
                                            <TableCell key={role.id} className="text-center">
                                                <div className="flex justify-center">
                                                    <Checkbox
                                                        checked={hasPermission(role.id, permission.id)}
                                                        onCheckedChange={() => togglePermission(role.id, permission.id)}
                                                        disabled={isSystemRole(role.name)}
                                                    />
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveAll} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving All...
                        </>
                    ) : (
                        'Save All Changes'
                    )}
                </Button>
            </div>
        </div>
    );
}

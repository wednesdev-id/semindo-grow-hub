import { useState, useEffect } from 'react'
import { roleService, permissionService, Role } from '@/services/roleService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RoleForm } from '@/components/roles/RoleForm'
import { Permission } from '@/types/auth' // Adjust if needed
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function UserRoleManagement() {
    const [roles, setRoles] = useState<Role[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [rolePermissions, setRolePermissions] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [rolesResponse, permissionsResponse] = await Promise.all([
                roleService.getAllRoles(),
                permissionService.getAllPermissions()
            ])

            setRoles(rolesResponse.data || rolesResponse)

            // Handle permission data structure
            const permData = permissionsResponse.data || permissionsResponse
            setAllPermissions(Array.isArray(permData) ? permData : (permData.data || []))

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load data',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchRolePermissions = async (roleId: string) => {
        try {
            const response = await roleService.getRolePermissions(roleId)
            const data = response.data || response
            const perms = Array.isArray(data) ? data : (data.data || [])
            return perms.map((p: any) => p.id)
        } catch (error) {
            console.error('Failed to fetch role permissions', error)
            return []
        }
    }

    const handleCreate = async (data: any) => {
        setSubmitting(true)
        try {
            // 1. Create Role
            const newRoleResponse = await roleService.createRole({
                name: data.name,
                displayName: data.displayName,
                description: data.description
            })

            const newRoleId = newRoleResponse.data?.id || newRoleResponse.id

            // 2. Assign Permissions
            if (data.permissions && data.permissions.length > 0) {
                await roleService.assignPermissions(newRoleId, data.permissions)
            }

            toast({ title: 'Success', description: 'Role created successfully' })
            setCreateDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create role',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async (data: any) => {
        if (!selectedRole) return
        setSubmitting(true)
        try {
            // 1. Update Details
            await roleService.updateRole(selectedRole.id, {
                displayName: data.displayName,
                description: data.description
            })

            // 2. Update Permissions
            // Ideally backend handles this, but if not we might need to re-assign
            // Assuming assignPermissions overwrites or we need to handle diff
            // For now, let's assume valid API exists or we just call assignPermissions
            await roleService.assignPermissions(selectedRole.id, data.permissions)

            toast({ title: 'Success', description: 'Role updated successfully' })
            setEditDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update role',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedRole) return
        setSubmitting(true)
        try {
            await roleService.deleteRole(selectedRole.id)
            toast({ title: 'Success', description: 'Role deleted successfully' })
            setDeleteDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete role',
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const openEditDialog = async (role: Role) => {
        setSelectedRole(role)
        // Fetch current permissions for this role
        const permissions = await fetchRolePermissions(role.id)
        setRolePermissions(permissions)
        setEditDialogOpen(true)
    }

    const isSystemRole = (roleName: string) => {
        return ['admin', 'super_admin', 'umkm', 'konsultan'].includes(roleName)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions for the system.</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                        List of all roles defined in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{role.displayName}</span>
                                            <span className="text-xs text-muted-foreground">{role.description}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{role.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="gap-1">
                                            <Shield className="h-3 w-3" />
                                            {role.permissionsCount || 0} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}
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
                                                onClick={() => {
                                                    setSelectedRole(role)
                                                    setDeleteDialogOpen(true)
                                                }}
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Role</DialogTitle>
                        <DialogDescription>Create a new role and define its permissions.</DialogDescription>
                    </DialogHeader>
                    <RoleForm
                        allPermissions={allPermissions}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        isSubmitting={submitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>Modify role details and permissions.</DialogDescription>
                    </DialogHeader>
                    {selectedRole && (
                        <RoleForm
                            initialData={{
                                name: selectedRole.name,
                                displayName: selectedRole.displayName,
                                description: selectedRole.description || '',
                                permissions: rolePermissions
                            }}
                            allPermissions={allPermissions}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditDialogOpen(false)}
                            isSubmitting={submitting}
                            isEdit={true}
                        />
                    )}
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
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

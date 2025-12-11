import { useState, useEffect } from 'react'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { User } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, Users, Building2, GraduationCap, BookOpen, ShoppingCart, CreditCard, Plane, MessageCircle, BarChart3, Settings, FileText, Wrench, Search } from 'lucide-react'

interface Role {
    id: string
    name: string
    displayName: string
    description: string
}

interface Permission {
    id: string
    name: string
    displayName: string
    description: string
}

interface PermissionGroup {
    module: string
    icon: any
    permissions: Permission[]
}

export default function UserRoleManagement() {
    const { toast } = useToast()

    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<Role[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
    const [customPermissions, setCustomPermissions] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [allPrivileges, setAllPrivileges] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Module icons mapping
    const moduleIcons: Record<string, any> = {
        users: Users,
        umkm: Building2,
        mentors: GraduationCap,
        programs: BookOpen,
        lms: GraduationCap,
        marketplace: ShoppingCart,
        financing: CreditCard,
        export: Plane,
        community: MessageCircle,
        consultation: MessageCircle,
        analytics: BarChart3,
        settings: Settings,
        logs: FileText,
        tools: Wrench
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchAllPermissions = async (): Promise<Permission[]> => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/permissions`)
            const data = await response.json()
            return data.data || data || []
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
            return []
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch all users
            const usersResponse = await userService.findAll({})
            setUsers(usersResponse.data || [])

            // Fetch all roles
            const rolesData = await roleService.getAllRoles() as Role[]
            setRoles(rolesData)

            // Fetch all permissions
            const permissionsData = await fetchAllPermissions()
            setAllPermissions(permissionsData)

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load data',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectUser = (user: User) => {
        setSelectedUser(user)
        // Set user's current roles
        const userRoles = user.roles?.map((r: any) => typeof r === 'string' ? r : r.id) || []
        setSelectedRoleIds(userRoles)
        // Reset custom permissions
        setCustomPermissions([])
        setAllPrivileges(false)
    }

    // Group permissions by module
    const groupedPermissions: PermissionGroup[] = (() => {
        const groups: Record<string, Permission[]> = {}

        allPermissions.forEach(perm => {
            const module = perm.name.split(':')[0]
            if (!groups[module]) {
                groups[module] = []
            }
            groups[module].push(perm)
        })

        return Object.entries(groups).map(([module, permissions]) => ({
            module,
            icon: moduleIcons[module] || Shield,
            permissions: permissions.sort((a, b) => a.name.localeCompare(b.name))
        }))
    })()

    const isPermissionEnabled = (permissionId: string): boolean => {
        if (allPrivileges) return true
        return customPermissions.includes(permissionId)
    }

    const toggleRole = (roleId: string) => {
        setSelectedRoleIds(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId)
            } else {
                return [...prev, roleId]
            }
        })
    }

    const togglePermission = (permissionId: string) => {
        setCustomPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId)
            } else {
                return [...prev, permissionId]
            }
        })
    }

    const toggleAllPrivileges = (enabled: boolean) => {
        setAllPrivileges(enabled)
        if (enabled) {
            setCustomPermissions([])
        }
    }

    const handleSave = async () => {
        if (!selectedUser) return

        try {
            setSaving(true)

            // TODO: Implement API calls
            // await userRoleService.assignRoles(selectedUser.id, selectedRoleIds)
            // await userPermissionService.updateCustomPermissions(selectedUser.id, customPermissions)

            toast({
                title: 'Success',
                description: 'User permissions updated successfully'
            })

            fetchData()

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save permissions',
                variant: 'destructive'
            })
        } finally {
            setSaving(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between p-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Manajemen Role & Permission
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola roles dan permissions untuk setiap user
                        </p>
                    </div>
                    {selectedUser && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Users */}
                <div className="w-80 border-r overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Pilih User</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Pilih user untuk manage roles & permissions
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* User List */}
                        <div className="space-y-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedUser?.id === user.id
                                            ? 'bg-primary/10 border-primary'
                                            : 'hover:bg-accent'
                                        }`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{user.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {user.roles?.map((role: any) => (
                                                    <Badge key={role} variant="secondary" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredUsers.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Tidak ada user ditemukan
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content - Permissions */}
                <div className="flex-1 overflow-y-auto">
                    {selectedUser ? (
                        <div className="p-6 space-y-6">
                            {/* Selected User Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        {selectedUser.fullName}
                                    </CardTitle>
                                    <CardDescription>{selectedUser.email}</CardDescription>
                                </CardHeader>
                            </Card>

                            {/* All Privileges Toggle */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Semua Privileges</CardTitle>
                                            <CardDescription>
                                                Berikan akses penuh ke semua modul dan fitur
                                            </CardDescription>
                                        </div>
                                        <Switch
                                            checked={allPrivileges}
                                            onCheckedChange={toggleAllPrivileges}
                                        />
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Roles Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Roles</CardTitle>
                                    <CardDescription>Assign roles untuk user ini</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {roles.map(role => (
                                            <div
                                                key={role.id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedRoleIds.includes(role.id)
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'hover:bg-accent'
                                                    }`}
                                                onClick={() => toggleRole(role.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedRoleIds.includes(role.id)}
                                                    onCheckedChange={() => toggleRole(role.id)}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{role.displayName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permission Groups */}
                            {groupedPermissions.map(group => {
                                const Icon = group.icon
                                return (
                                    <Card key={group.module}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Icon className="h-5 w-5" />
                                                <span className="capitalize">
                                                    {group.module.replace('_', ' ')}
                                                </span>
                                                <Badge variant="outline">
                                                    {group.permissions.length} permissions
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {group.permissions.map(permission => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                                                        onClick={() => !allPrivileges && togglePermission(permission.id)}
                                                    >
                                                        <Checkbox
                                                            checked={isPermissionEnabled(permission.id)}
                                                            disabled={allPrivileges}
                                                            onCheckedChange={() => togglePermission(permission.id)}
                                                        />
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-sm font-medium cursor-pointer">
                                                                {permission.displayName}
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">
                                                                {permission.description}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {permission.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Pilih User</h3>
                                <p className="text-sm text-muted-foreground">
                                    Pilih user dari sidebar untuk manage roles & permissions
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

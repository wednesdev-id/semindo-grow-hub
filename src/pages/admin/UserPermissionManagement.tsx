import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@/types/auth'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Shield, Users, Building2, GraduationCap, BookOpen, ShoppingCart, CreditCard, Plane, MessageCircle, BarChart3, Settings, FileText, Wrench } from 'lucide-react'

interface Role {
    id: string
    name: string
    displayName: string
    description: string
    permissionsCount?: number
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

export default function UserPermissionManagement() {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<Role[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
    const [customPermissions, setCustomPermissions] = useState<string[]>([]) // Permission IDs
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [allPrivileges, setAllPrivileges] = useState(false)

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
    }, [userId])

    // Temporary helper to fetch permissions
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

            // Fetch user details
            const userResponse = await userService.findById(userId!)
            setUser(userResponse.data)

            // Fetch all roles
            const rolesData = await roleService.getAllRoles() as Role[]
            setRoles(rolesData)

            // Fetch all permissions (we'll create a simple service for this)
            // For now, use hardcoded module-based permissions
            const permissionsData = await fetchAllPermissions()
            setAllPermissions(permissionsData)

            // Fetch user's current roles
            const userRoles = userResponse.data.roles?.map((r: any) => r.id) || []
            setSelectedRoleIds(userRoles)

            // TODO: Fetch custom permissions if API exists
            // const customPerms = await userPermissionService.getCustomPermissions(userId!)
            // setCustomPermissions(customPerms)

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

    // Group permissions by module
    const groupedPermissions: PermissionGroup[] = (() => {
        const groups: Record<string, Permission[]> = {}

        allPermissions.forEach(perm => {
            const module = perm.name.split(':')[0] // e.g., "users:view" -> "users"
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

    // Calculate effective permissions (from roles + custom)
    const getEffectivePermissions = (): string[] => {
        if (allPrivileges) {
            return allPermissions.map(p => p.id)
        }

        const rolePermissions = new Set<string>()

        // Get permissions from selected roles
        roles.forEach(role => {
            if (selectedRoleIds.includes(role.id)) {
                // TODO: Fetch role permissions from API
                // For now, we'll just mark that this needs role permissions
            }
        })

        // Add custom permissions
        customPermissions.forEach(permId => rolePermissions.add(permId))

        return Array.from(rolePermissions)
    }

    const isPermissionEnabled = (permissionId: string): boolean => {
        if (allPrivileges) return true
        return getEffectivePermissions().includes(permissionId)
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
            // Clear custom permissions when all privileges enabled
            setCustomPermissions([])
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Update user roles
            // await userRoleService.assignRoles(userId!, selectedRoleIds)

            // Update custom permissions
            // await userPermissionService.updateCustomPermissions(userId!, customPermissions)

            toast({
                title: 'Success',
                description: 'User permissions updated successfully'
            })

            navigate('/admin/users')

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-6">
                <p>User not found</p>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/admin/users')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                User Permissions
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {user.fullName} ({user.email})
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Roles */}
                <div className="w-80 border-r overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Roles</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select roles to assign permissions
                            </p>
                        </div>

                        <div className="space-y-2">
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
                                        <p className="font-medium">{role.displayName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {role.description}
                                        </p>
                                    </div>
                                    {role.permissionsCount && (
                                        <Badge variant="secondary" className="text-xs">
                                            {role.permissionsCount}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content - Permissions */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* All Privileges Toggle */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>All Privileges</CardTitle>
                                        <CardDescription>
                                            Grant full access to all modules and features
                                        </CardDescription>
                                    </div>
                                    <Switch
                                        checked={allPrivileges}
                                        onCheckedChange={toggleAllPrivileges}
                                    />
                                </div>
                            </CardHeader>
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
                </div>
            </div>
        </div>
    )
}

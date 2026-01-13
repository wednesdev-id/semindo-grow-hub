import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Building2, GraduationCap, BookOpen, ShoppingCart, CreditCard, Plane, MessageCircle, BarChart3, Settings, FileText, Wrench } from 'lucide-react'
import { Permission, PermissionGroup } from '@/types/auth' // You might need to adjust imports

interface RoleFormProps {
    initialData?: {
        name: string
        displayName: string
        description: string
        permissions: string[]
    }
    allPermissions: Permission[]
    onSubmit: (data: any) => void
    onCancel: () => void
    isSubmitting?: boolean
    isEdit?: boolean
}

// Map icons (copied from UserRoleManagement for consistency)
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

export function RoleForm({ initialData, allPermissions, onSubmit, onCancel, isSubmitting = false, isEdit = false }: RoleFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
    })

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                displayName: initialData.displayName,
                description: initialData.description,
            })
            setSelectedPermissions(initialData.permissions || [])
        }
    }, [initialData])

    // Group permissions logic
    const groupedPermissions = (() => {
        const groups: Record<string, Permission[]> = {}
        allPermissions.forEach(perm => {
            const module = perm.name.split('.')[0] // Assuming structure like 'users.create'
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

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const toggleGroup = (modulePermissions: Permission[]) => {
        const allIds = modulePermissions.map(p => p.id)
        const allSelected = allIds.every(id => selectedPermissions.includes(id))

        if (allSelected) {
            // Deselect all
            setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)))
        } else {
            // Select all
            const newIds = allIds.filter(id => !selectedPermissions.includes(id))
            setSelectedPermissions(prev => [...prev, ...newIds])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            ...formData,
            permissions: selectedPermissions
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Role Name *</Label>
                    <Input
                        id="displayName"
                        placeholder="e.g. HR Manager"
                        value={formData.displayName}
                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        required
                    />
                </div>
                {!isEdit && (
                    <div className="space-y-2">
                        <Label htmlFor="name">Role Slug *</Label>
                        <Input
                            id="name"
                            placeholder="e.g. hr_manager"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <p className="text-[10px] text-muted-foreground">Unique identifier, lowercase only.</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Enter role description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Permissions *</Label>
                    <span className="text-sm text-muted-foreground">
                        {selectedPermissions.length} of {allPermissions.length} selected
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {groupedPermissions.map(group => {
                        const Icon = group.icon
                        const allSelected = group.permissions.every(p => selectedPermissions.includes(p.id))

                        return (
                            <Card key={group.module} className="border shadow-sm">
                                <CardHeader className="p-3 pb-2 border-b bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-sm font-medium capitalize">
                                                {group.module.replace('_', ' ')}
                                            </CardTitle>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => toggleGroup(group.permissions)}
                                        >
                                            {allSelected ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.permissions.map(perm => (
                                            <div key={perm.id} className="flex items-start space-x-2">
                                                <Checkbox
                                                    id={perm.id}
                                                    checked={selectedPermissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={perm.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {perm.displayName || perm.name}
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {perm.description || perm.name}
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

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (isEdit ? 'Update Role' : 'Create Role')}
                </Button>
            </div>
        </form>
    )
}

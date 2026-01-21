import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { User } from '@/types/auth'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Search, Pencil, Trash2, Upload, Download, ExternalLink, Eye } from 'lucide-react'
import { ImportUsersDialog } from '@/components/admin/ImportUsersDialog'
import LocationPicker, { LocationData } from '@/components/ui/location-picker'

// Type-safe API response interfaces
interface PaginatedUsersResponse {
    data: User[]
    meta: {
        page: number
        limit: number
        total: number
        lastPage: number
    }
}

interface ApiResponse<T> {
    success: boolean
    data: T
}

interface UserManagementProps {
    defaultRole?: string;
}

export default function UserManagement({ defaultRole }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchSearchParams.get('search') || '')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const { toast } = useToast()
    const navigate = useNavigate()

    const [roleFilter, setRoleFilter] = useState(defaultRole || 'all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [availableRoles, setAvailableRoles] = useState<any[]>([])
    const [userUmkmProfiles, setUserUmkmProfiles] = useState<any[]>([])
    const [selectedUmkmId, setSelectedUmkmId] = useState<string>('')

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await roleService.getAllRoles()
                setAvailableRoles(response.data || [])
            } catch (error) {
                console.error("Failed to fetch roles", error)
            }
        }
        fetchRoles()
    }, [])

    // Sync roleFilter with defaultRole when it changes
    useEffect(() => {
        if (defaultRole) {
            setRoleFilter(defaultRole)
        } else {
            setRoleFilter('all')
        }
    }, [defaultRole])

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        role: defaultRole || 'umkm',
        phone: '',
        businessName: '',
        location: { address: '', city: '', province: '', lat: 0, lng: 0 } as LocationData
    })

    // Fetch UMKM profiles when editing user with UMKM role
    useEffect(() => {
        const fetchUmkmProfiles = async () => {
            if (selectedUser && selectedUser.roles?.includes('umkm')) {
                try {
                    const response = await api.get<{ data: any[] }>(`/umkm?userId=${selectedUser.id}`)
                    const profiles = response.data || []
                    setUserUmkmProfiles(profiles)
                    // Auto-select the first UMKM profile if available
                    if (profiles.length > 0) {
                        setSelectedUmkmId(profiles[0].id)
                    } else {
                        setSelectedUmkmId('')
                    }
                } catch (error) {
                    console.error('Failed to fetch UMKM profiles', error)
                    setUserUmkmProfiles([])
                }
            } else {
                setUserUmkmProfiles([])
                setSelectedUmkmId('')
            }
        }
        fetchUmkmProfiles()
    }, [selectedUser])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // Pass filters to findAll
            const res = await userService.findAll({
                page,
                search,
                role: roleFilter === 'all' ? undefined : roleFilter,
                isActive: statusFilter === 'all' ? undefined : statusFilter
            })

            // Handle nested data structure from API
            // Response can be { data: User[], meta: ... } or just User[]
            const responseData = res.data as PaginatedUsersResponse | User[];

            // Check if it's a paginated response
            if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                setUsers(responseData.data)
                if (responseData.meta) {
                    setTotalPages(responseData.meta.lastPage || 1)
                }
            } else if (Array.isArray(responseData)) {
                // Direct array response
                setUsers(responseData)
                setTotalPages(1)
            } else {
                console.error('Invalid users data:', res)
                setUsers([])
                setTotalPages(1)
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Debounced search effect (only for search)
    useEffect(() => {
        const debounce = setTimeout(() => {
            setPage(1) // Reset to page 1 when searching
            fetchUsers()
        }, 500)
        return () => clearTimeout(debounce)
    }, [search])

    // Immediate fetch for page and filters (no debounce)
    useEffect(() => {
        fetchUsers()
    }, [page, roleFilter, statusFilter])

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault()

        // Manual Validation
        if (!formData.email || !formData.fullName) {
            toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
            return
        }
        if (!selectedUser && !formData.password) {
            toast({ title: 'Error', description: 'Password is required for new users', variant: 'destructive' })
            return
        }

        try {
            // Transform location data for backend
            const submitData = {
                email: formData.email,
                fullName: formData.fullName,
                password: formData.password || undefined,
                role: formData.role,
                phone: formData.phone || undefined,
                businessName: formData.businessName || undefined,
                // User personal location fields
                address: formData.location?.address || undefined,
                city: formData.location?.city || undefined,
                province: formData.location?.province || undefined,
                location: formData.location?.lat && formData.location?.lng
                    ? { lat: formData.location.lat, lng: formData.location.lng }
                    : undefined,
            }

            if (selectedUser) {
                await userService.update(selectedUser.id, submitData)
                toast({ title: 'Success', description: 'User updated successfully' })
            } else {
                await userService.create(submitData)
                toast({ title: 'Success', description: 'User created successfully' })
            }
            setIsDialogOpen(false)
            fetchUsers()
            resetForm()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Operation failed',
                variant: 'destructive',
            })
        }
    }

    const handleDelete = async (id: string) => {
        setUserToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return

        try {
            await userService.delete(userToDelete)
            toast({ title: 'Success', description: 'User deleted successfully' })
            fetchUsers()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Delete failed',
                variant: 'destructive',
            })
        } finally {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    const openEdit = (user: User) => {
        setSelectedUser(user)

        // PRIORITY 1: User's personal location
        // PRIORITY 2: Fallback to UMKM profile location (business address)
        let userLocation = { address: '', city: '', province: '', lat: 0, lng: 0 }

        if (user.location && user.location.lat && user.location.lng) {
            // Personal location exists
            userLocation = {
                address: user.address || '',
                city: user.city || '',
                province: user.province || '',
                lat: user.location.lat,
                lng: user.location.lng
            }
        } else if (user.umkmProfile?.location) {
            // Fallback to business location
            userLocation = {
                address: user.umkmProfile.address || '',
                city: user.umkmProfile.city || '',
                province: user.umkmProfile.province || '',
                lat: user.umkmProfile.location.lat,
                lng: user.umkmProfile.location.lng
            }
        }

        setFormData({
            email: user.email,
            fullName: user.fullName,
            password: '', // Don't fill password
            role: user.roles?.[0] || defaultRole || 'umkm',
            phone: user.phone || '',
            businessName: user.businessName || '',
            location: userLocation
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setSelectedUser(null)
        setFormData({
            email: '',
            fullName: '',
            password: '',
            role: defaultRole || 'umkm',
            phone: '',
            businessName: '',
            location: { address: '', city: '', province: '', lat: 0, lng: 0 }
        })
    }

    const getPageTitle = () => {
        if (defaultRole === 'umkm') return 'UMKM Management';
        if (defaultRole === 'mentor') return 'Mentor Management';
        if (defaultRole === 'admin') return 'Admin Management';
        return 'User Management';
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setImportDialogOpen(true)}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await userService.exportUsers({
                                    role: roleFilter === 'all' ? undefined : roleFilter,
                                    isActive: statusFilter === 'all' ? undefined : statusFilter,
                                    search: search || undefined
                                })
                                toast({
                                    title: 'Success',
                                    description: 'Users exported successfully'
                                })
                            } catch (err: any) {
                                toast({
                                    title: 'Error',
                                    description: err.message || 'Export failed',
                                    variant: 'destructive'
                                })
                            }
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add {defaultRole ? defaultRole.toUpperCase() : 'User'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={false} // Allow email editing
                                        required
                                    />
                                    {selectedUser && (
                                        <p className="text-xs text-muted-foreground">
                                            ⚠️ Changing email will require re-verification
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password
                                        {selectedUser && <span className="text-muted-foreground"> (optional)</span>}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={selectedUser ? "Leave blank to keep current password" : ""}
                                        required={!selectedUser}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        disabled={!!defaultRole} // Disable if defaultRole is set
                                    >
                                        {defaultRole ? (
                                            <option value={defaultRole}>
                                                {{
                                                    'umkm': 'UMKM',
                                                    'admin': 'Admin',
                                                    'konsultan': 'Konsultan',
                                                    'mentor': 'Mentor',
                                                    'trainer': 'Trainer',
                                                    'staff': 'Staff Manajemen'
                                                }[defaultRole] || defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)}
                                            </option>
                                        ) : (
                                            <>
                                                {availableRoles.length > 0 ? (
                                                    availableRoles.map(role => (
                                                        <option key={role.id} value={role.name}>
                                                            {role.displayName}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option disabled>Loading roles...</option>
                                                )}
                                            </>
                                        )}
                                    </select>
                                </div>
                                {(formData.role === 'umkm' || selectedUser?.roles?.includes('umkm')) && selectedUser && (
                                    <div className="grid gap-2">
                                        <Label>Usaha UMKM</Label>
                                        {userUmkmProfiles.length > 0 ? (
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={selectedUmkmId}
                                                    onChange={(e) => setSelectedUmkmId(e.target.value)}
                                                >
                                                    <option value="">-- Pilih Usaha --</option>
                                                    {userUmkmProfiles.map((umkm: any) => (
                                                        <option key={umkm.id} value={umkm.id}>
                                                            {umkm.businessName} ({umkm.sector || 'N/A'})
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={!selectedUmkmId}
                                                    onClick={() => {
                                                        if (selectedUmkmId) {
                                                            setIsDialogOpen(false)
                                                            window.open(`/admin/umkm/${selectedUmkmId}`, '_blank')
                                                        }
                                                    }}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">User ini belum memiliki usaha UMKM</p>
                                        )}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+62812345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <LocationPicker
                                        label="Alamat"
                                        placeholder="Pilih lokasi di peta atau ketik alamat..."
                                        value={formData.location}
                                        onChange={(loc) => setFormData({ ...formData, location: loc })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" onClick={(e) => handleSubmit(e as any)}>Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {!defaultRole && (
                    <div className="w-full md:w-48">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            {availableRoles.map(role => (
                                <option key={role.id} value={role.name}>
                                    {role.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full md:w-48">
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            {!defaultRole && <TableHead className="hidden md:table-cell">Role</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={defaultRole ? 4 : 5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={defaultRole ? 4 : 5} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div>{user.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{user.businessName}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                    {!defaultRole && (
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline" className="capitalize">
                                                {user.roles?.[0] || 'User'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)} title="Lihat Detail">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Edit">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(user.id)} title="Hapus">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination UI */}
            {
                !loading && users.length > 0 && (
                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )
            }

            {/* Import Users Dialog */}
            <ImportUsersDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                onSuccess={() => {
                    fetchUsers()
                    toast({
                        title: 'Success',
                        description: 'Users imported successfully'
                    })
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and remove their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

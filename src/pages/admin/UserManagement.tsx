import { useState, useEffect } from 'react'
import { User } from '@/types/auth'
import { userService } from '@/services/userService'
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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface UserManagementProps {
    defaultRole?: string;
}

export default function UserManagement({ defaultRole }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const { toast } = useToast()

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        role: defaultRole || 'umkm',
        phone: '',
        businessName: ''
    })

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // Pass defaultRole to findAll if it exists
            const res = await userService.findAll({ page, search, role: defaultRole })
            setUsers(res.data.data)
            setTotalPages(res.data.meta.totalPages)
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

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers()
        }, 500)
        return () => clearTimeout(debounce)
    }, [page, search, defaultRole])

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault()
        console.log('Submitting form:', formData)

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
            if (selectedUser) {
                await userService.update(selectedUser.id, formData)
                toast({ title: 'Success', description: 'User updated successfully' })
            } else {
                console.log('Creating user...')
                await userService.create(formData)
                console.log('User created!')
                toast({ title: 'Success', description: 'User created successfully' })
            }
            setIsDialogOpen(false)
            fetchUsers()
            resetForm()
        } catch (error: any) {
            console.error('Form submission error:', error)
            toast({
                title: 'Error',
                description: error.message || 'Operation failed',
                variant: 'destructive',
            })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            await userService.delete(id)
            toast({ title: 'Success', description: 'User deleted successfully' })
            fetchUsers()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Delete failed',
                variant: 'destructive',
            })
        }
    }

    const openEdit = (user: User) => {
        setSelectedUser(user)
        setFormData({
            email: user.email,
            fullName: user.fullName,
            password: '', // Don't fill password
            role: user.roles?.[0] || defaultRole || 'umkm',
            phone: user.phone || '',
            businessName: user.businessName || ''
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
            businessName: ''
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
                                    disabled={!!selectedUser} // Disable email edit
                                    required
                                />
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
                            {!selectedUser && (
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    disabled={!!defaultRole} // Disable if defaultRole is set
                                >
                                    <option value="umkm">UMKM</option>
                                    <option value="admin">Admin</option>
                                    <option value="mentor">Mentor</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="businessName">Business Name (Optional)</Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={(e) => handleSubmit(e as any)}>Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(user.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

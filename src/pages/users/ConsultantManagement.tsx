import { useState, useEffect } from 'react';
import { consultationService } from '@/services/consultationService';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Pencil, Trash2, Eye, BookOpen, Star } from 'lucide-react';

interface ConsultantUser {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    businessName?: string;
    consultantProfile?: {
        id: string;
        title: string;
        expertiseAreas: string[];
        status: string;
        averageRating: number;
        totalSessions: number;
        isAcceptingNewClients: boolean;
        canTeachCourses: boolean;
        totalCoursesCreated: number;
    };
    createdAt: string;
}

export default function ConsultantManagement() {
    const [consultants, setConsultants] = useState<ConsultantUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ConsultantUser | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        phone: '',
        businessName: '',
        role: 'konsultan' // Fixed role for this page
    });

    const { toast } = useToast();

    // Load Data
    const fetchConsultants = async () => {
        setLoading(true);
        try {
            const data = await consultationService.listConsultants({ status: 'all' });

            // Map API data (ConsultantProfile w/ User) to Component State (User w/ ConsultantProfile)
            const mappedConsultants: ConsultantUser[] = data.map((profile: any) => {
                return {
                    id: profile.user.id,
                    fullName: profile.user.fullName,
                    email: profile.user.email,
                    phone: profile.user.phone,
                    businessName: profile.user.businessName,
                    consultantProfile: {
                        id: profile.id, // Profile ID
                        title: profile.title,
                        expertiseAreas: profile.expertiseAreas,
                        status: profile.status,
                        averageRating: profile.averageRating,
                        totalSessions: profile.totalSessions,
                        isAcceptingNewClients: profile.isAcceptingNewClients,
                        canTeachCourses: false, // Default or fetch if needed
                        totalCoursesCreated: 0 // Default
                    },
                    createdAt: profile.createdAt
                };
            });

            setConsultants(mappedConsultants);
        } catch (error) {
            console.error('Failed to load consultants:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch consultants',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultants();
    }, []);

    // Filter Logic
    const filteredConsultants = consultants.filter(consultant => {
        const matchesSearch = consultant.fullName.toLowerCase().includes(search.toLowerCase()) ||
            consultant.email.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    // Form Handlers
    const resetForm = () => {
        setSelectedUser(null);
        setFormData({
            email: '',
            fullName: '',
            password: '',
            phone: '',
            businessName: '',
            role: 'konsultan'
        });
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (user: ConsultantUser) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            fullName: user.fullName,
            password: '', // Password not filled for edit
            phone: user.phone || '',
            businessName: user.businessName || '',
            role: 'konsultan' // Ensure role is kept
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.fullName) {
            toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
            return;
        }

        try {
            if (selectedUser) {
                // Update Logic
                // Only send password if it's not empty
                const updateData: any = { ...formData };
                if (!updateData.password) delete updateData.password;

                await userService.update(selectedUser.id, updateData);
                toast({ title: 'Success', description: 'Consultant updated successfully' });
            } else {
                // Create Logic
                if (!formData.password) {
                    toast({ title: 'Error', description: 'Password is required for new users', variant: 'destructive' });
                    return;
                }
                await userService.create(formData);
                toast({ title: 'Success', description: 'Consultant created successfully' });
            }

            setIsDialogOpen(false);
            fetchConsultants();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Operation failed',
                variant: 'destructive',
            });
        }
    };

    // Delete Logic
    const handleDelete = async (id: string) => {
        setUserToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await userService.delete(userToDelete);
            toast({ title: 'Success', description: 'Consultant deleted successfully' });
            fetchConsultants();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to delete consultant',
                variant: 'destructive',
            });
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };



    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kelola Konsultan</h1>
                    <p className="text-muted-foreground">
                        Manage consultant profiles, approvals, and performance.
                    </p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Consultant
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
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
                            <TableHead>Expertise</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Performance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredConsultants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No consultants found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConsultants.map((consultant) => (
                                <TableRow key={consultant.id}>
                                    <TableCell className="font-medium">
                                        <div>{consultant.fullName}</div>
                                        <div className="text-xs text-muted-foreground">{consultant.consultantProfile?.title || 'Consultant'}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {consultant.email}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {consultant.consultantProfile?.expertiseAreas?.length ? (
                                                <>
                                                    {consultant.consultantProfile.expertiseAreas.slice(0, 2).map((area, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs font-normal">
                                                            {area}
                                                        </Badge>
                                                    ))}
                                                    {consultant.consultantProfile.expertiseAreas.length > 2 && (
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            +{consultant.consultantProfile.expertiseAreas.length - 2}
                                                        </Badge>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                Active
                                            </Badge>
                                            {consultant.consultantProfile?.canTeachCourses && (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                                                    Instructor
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                <span className="font-medium">{consultant.consultantProfile?.averageRating.toFixed(1) || '0.0'}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {consultant.consultantProfile?.totalSessions || 0} Sessions
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(consultant)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(consultant.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredConsultants.length} of {consultants.length} consultants
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? 'Edit Consultant' : 'Add New Consultant'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                                required
                                disabled={!!selectedUser}
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
                                placeholder="e.g. Budi Santoso"
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
                                disabled
                            >
                                <option value="konsultan">Konsultan</option>
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
                        <DialogFooter>
                            <Button type="button" onClick={(e) => handleSubmit(e as any)}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the consultant profile and data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

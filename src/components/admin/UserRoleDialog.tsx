import { useState, useEffect } from 'react';
import { roleService, userRoleService, Role } from '@/services/roleService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    currentRoles: string[];
    onSuccess: () => void;
}

export function UserRoleDialog({ open, onOpenChange, userId, userName, currentRoles, onSuccess }: UserRoleDialogProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchRoles();
            setSelectedRoles(new Set(currentRoles));
        }
    }, [open, currentRoles]);

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

    const toggleRole = (roleId: string) => {
        const newSelected = new Set(selectedRoles);
        if (newSelected.has(roleId)) {
            newSelected.delete(roleId);
        } else {
            newSelected.add(roleId);
        }
        setSelectedRoles(newSelected);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await userRoleService.assignRoles(userId, Array.from(selectedRoles));
            toast({
                title: 'Success',
                description: 'User roles updated successfully',
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update roles',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Roles</DialogTitle>
                    <DialogDescription>
                        Manage roles for {userName}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {roles.map((role) => (
                            <div key={role.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={selectedRoles.has(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                />
                                <Label
                                    htmlFor={`role-${role.id}`}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div>
                                        <p className="font-medium">{role.displayName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {role.description || role.name}
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? (
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
    );
}

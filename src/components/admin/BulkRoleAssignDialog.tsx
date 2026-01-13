import { useState, useEffect } from 'react';
import { roleService, Role } from '@/services/roleService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BulkRoleAssignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    onAssign: (roleIds: string[]) => void;
}

export function BulkRoleAssignDialog({ open, onOpenChange, selectedCount, onAssign }: BulkRoleAssignDialogProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchRoles();
        }
    }, [open]);

    const fetchRoles = async () => {
        try {
            const response = await roleService.getAllRoles() as any;
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

    const handleAssign = () => {
        if (selectedRoles.size === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one role',
                variant: 'destructive',
            });
            return;
        }
        onAssign(Array.from(selectedRoles));
        handleClose();
    };

    const handleClose = () => {
        setSelectedRoles(new Set());
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Roles to {selectedCount} User(s)</DialogTitle>
                    <DialogDescription>
                        Select roles to assign to the selected users. This will replace their current roles.
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
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={loading || selectedRoles.size === 0}>
                        Assign {selectedRoles.size} Role(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

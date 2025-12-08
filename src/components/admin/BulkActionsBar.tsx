import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, CheckCircle, XCircle, Users } from 'lucide-react';
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

interface BulkActionsBarProps {
    selectedCount: number;
    onBulkDelete: () => void;
    onBulkActivate: () => void;
    onBulkDeactivate: () => void;
    onBulkAssignRoles: () => void;
    onClearSelection: () => void;
}

export function BulkActionsBar({
    selectedCount,
    onBulkDelete,
    onBulkActivate,
    onBulkDeactivate,
    onBulkAssignRoles,
    onClearSelection,
}: BulkActionsBarProps) {
    const [action, setAction] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleAction = (value: string) => {
        setAction(value);

        switch (value) {
            case 'delete':
                setShowDeleteConfirm(true);
                break;
            case 'activate':
                onBulkActivate();
                break;
            case 'deactivate':
                onBulkDeactivate();
                break;
            case 'assign-roles':
                onBulkAssignRoles();
                break;
        }

        setAction('');
    };

    const handleConfirmDelete = () => {
        onBulkDelete();
        setShowDeleteConfirm(false);
    };

    if (selectedCount === 0) return null;

    return (
        <>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedCount} user(s) selected</span>
                    <Button variant="ghost" size="sm" onClick={onClearSelection}>
                        Clear
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={action} onValueChange={handleAction}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Bulk actions..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="activate">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Activate Selected
                                </div>
                            </SelectItem>
                            <SelectItem value="deactivate">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Deactivate Selected
                                </div>
                            </SelectItem>
                            <SelectItem value="assign-roles">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Assign Roles
                                </div>
                            </SelectItem>
                            <SelectItem value="delete">
                                <div className="flex items-center gap-2 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Selected
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedCount} user(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected users
                            and remove their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

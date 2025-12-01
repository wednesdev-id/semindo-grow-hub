import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Shield } from "lucide-react";
import { userService } from "@/services/userService";
import { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function UserRoleManagement() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await userService.updateUserRole(userId, newRole);
            toast({
                title: "Role Updated",
                description: "User role has been updated successfully.",
            });
            fetchUsers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user role.",
                variant: "destructive",
            });
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "fullName" as const,
            className: "font-medium",
        },
        {
            header: "Email",
            accessorKey: "email" as const,
        },
        {
            header: "Role",
            accessorKey: "roles" as const,
            cell: (item: User) => item.roles?.join(", ") || "-",
        },
        {
            header: "Status",
            accessorKey: "isActive" as const,
            cell: (item: User) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />,
        },
        {
            header: "Joined",
            accessorKey: "createdAt" as const,
            cell: (item: User) => new Date(item.createdAt).toLocaleDateString('id-ID'),
        },
        {
            header: "Actions",
            cell: (item: User) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRoleUpdate(item.id, 'admin')}>
                        <Shield className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6">
            <DashboardPageHeader
                title="User Management"
                description="Manage users and their roles."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Users", href: "/users/all" },
                    { label: "List" },
                ]}
            />

            <DataGrid
                data={users}
                columns={columns}
                searchKey="fullName"
                searchPlaceholder="Search users..."
            />
        </div>
    );
}

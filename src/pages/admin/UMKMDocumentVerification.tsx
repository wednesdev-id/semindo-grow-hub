import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, FileText } from "lucide-react";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function UMKMDocumentVerification() {
    const { toast } = useToast();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const data = await userService.getPendingDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleVerify = async (id: string, approved: boolean) => {
        try {
            await userService.verifyDocument(id, approved);
            toast({
                title: approved ? "Document Verified" : "Document Rejected",
                description: `The document has been ${approved ? "verified" : "rejected"}.`,
                variant: approved ? "default" : "destructive",
            });
            // Optimistically update or refetch
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to verify document.",
                variant: "destructive",
            });
        }
    };

    const columns = [
        {
            header: "User",
            accessorKey: "user" as const,
            className: "font-medium",
        },
        {
            header: "Document Type",
            accessorKey: "type" as const,
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            cell: (item: any) => <StatusBadge status={item.status} />,
        },
        {
            header: "Uploaded At",
            accessorKey: "submittedAt" as const,
        },
        {
            header: "Actions",
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => window.open(item.url, '_blank')}>
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600"
                        onClick={() => handleVerify(item.id, true)}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleVerify(item.id, false)}
                    >
                        <X className="h-4 w-4" />
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
                title="Document Verification"
                description="Verify legal documents uploaded by UMKM."
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "UMKM", href: "/umkm/list" },
                    { label: "Documents" },
                ]}
            />

            <DataGrid
                data={documents}
                columns={columns}
                searchKey="user"
                searchPlaceholder="Search user..."
            />
        </div>
    );
}

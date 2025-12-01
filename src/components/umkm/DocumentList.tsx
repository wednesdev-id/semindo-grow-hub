import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Upload } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface Document {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

interface DocumentListProps {
    umkmId: string;
    documents: Document[];
    onUpdate: () => void;
}

export default function DocumentList({ umkmId, documents = [], onUpdate }: DocumentListProps) {
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'Other'); // Default type for now, can be enhanced with a dialog
        formData.append('fileName', file.name);

        setUploading(true);
        try {
            await api.post(`/umkm/${umkmId}/documents`, formData);
            toast.success('Document uploaded successfully');
            onUpdate();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleVerify = async (docId: string, status: 'verified' | 'rejected') => {
        setVerifying(docId);
        try {
            await api.patch(`/umkm/documents/${docId}/verify`, {
                status,
                reason: status === 'rejected' ? 'Document invalid or unclear' : undefined,
            });
            toast.success(`Document ${status}`);
            onUpdate();
        } catch (error) {
            toast.error('Failed to verify document');
        } finally {
            setVerifying(null);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Legal Documents</CardTitle>
                    <CardDescription>Manage and verify UMKM documents.</CardDescription>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={handleFileSelect}
                    />
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload New'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Uploaded At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No documents uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.type}</TableCell>
                                    <TableCell>{doc.fileName}</TableCell>
                                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                doc.status === 'verified' ? 'default' :
                                                    doc.status === 'rejected' ? 'destructive' : 'secondary'
                                            }
                                        >
                                            {doc.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => window.open(doc.fileUrl, '_blank')}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {doc.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleVerify(doc.id, 'verified')}
                                                        disabled={!!verifying}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleVerify(doc.id, 'rejected')}
                                                        disabled={!!verifying}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

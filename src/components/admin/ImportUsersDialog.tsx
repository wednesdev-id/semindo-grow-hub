import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Download, FileText } from 'lucide-react';
import { userService } from '@/services/userService';
import { Badge } from '@/components/ui/badge';

interface ImportUsersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ImportUsersDialog({ open, onOpenChange, onSuccess }: ImportUsersDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [csvContent, setCsvContent] = useState<string>('');
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [validation, setValidation] = useState<any>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast({
                title: 'Error',
                description: 'Please select a CSV file',
                variant: 'destructive',
            });
            return;
        }

        setFile(selectedFile);

        // Read file content
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            setCsvContent(content);

            // Auto-validate
            await validateFile(content);
        };
        reader.readAsText(selectedFile);
    };

    const validateFile = async (content: string) => {
        setValidating(true);
        try {
            const response = await userService.validateImport(content);
            setValidation(response.data);

            if (response.data.invalid > 0) {
                toast({
                    title: 'Validation Warning',
                    description: `Found ${response.data.invalid} invalid row(s)`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Validation Success',
                    description: `${response.data.valid} row(s) ready to import`,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Validation Error',
                description: error.message || 'Failed to validate file',
                variant: 'destructive',
            });
        } finally {
            setValidating(false);
        }
    };

    const handleImport = async () => {
        if (!csvContent || !validation || validation.invalid > 0) return;

        setImporting(true);
        try {
            const response = await userService.importUsers(csvContent);
            toast({
                title: 'Import Success',
                description: `Imported ${response.data.imported} user(s)`,
            });
            onSuccess();
            handleClose();
        } catch (error: any) {
            toast({
                title: 'Import Error',
                description: error.message || 'Failed to import users',
                variant: 'destructive',
            });
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await userService.downloadTemplate();
            toast({
                title: 'Success',
                description: 'Template downloaded',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to download template',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        setFile(null);
        setCsvContent('');
        setValidation(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Users from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to import multiple users at once
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Template Download */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">CSV Template</p>
                                <p className="text-sm text-muted-foreground">
                                    Download template with example data
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </div>

                    {/* File Upload */}
                    <div className="grid gap-2">
                        <Label htmlFor="csv-file">Upload CSV File</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="csv-file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={validating || importing}
                            />
                            {validating && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>

                    {/* Validation Results */}
                    {validation && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 border rounded-lg">
                                    <p className="text-sm text-muted-foreground">Valid Rows</p>
                                    <p className="text-2xl font-bold text-green-600">{validation.valid}</p>
                                </div>
                                <div className="flex-1 p-4 border rounded-lg">
                                    <p className="text-sm text-muted-foreground">Invalid Rows</p>
                                    <p className="text-2xl font-bold text-destructive">{validation.invalid}</p>
                                </div>
                            </div>

                            {/* Errors */}
                            {validation.errors && validation.errors.length > 0 && (
                                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                                    <p className="font-medium mb-2">Validation Errors:</p>
                                    <div className="space-y-2">
                                        {validation.errors.map((error: any, index: number) => (
                                            <div key={index} className="text-sm">
                                                <Badge variant="destructive" className="mr-2">
                                                    Row {error.row}
                                                </Badge>
                                                <span className="font-medium">{error.field}:</span>{' '}
                                                <span className="text-muted-foreground">{error.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview */}
                            {validation.preview && validation.preview.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">Preview (first 5 rows):</p>
                                    <div className="space-y-2 text-sm">
                                        {validation.preview.map((row: any, index: number) => (
                                            <div key={index} className="flex gap-2">
                                                <Badge variant="outline">{index + 1}</Badge>
                                                <span>{row.email}</span>
                                                <span className="text-muted-foreground">-</span>
                                                <span>{row.fullName}</span>
                                                <span className="text-muted-foreground">-</span>
                                                <Badge>{row.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!validation || validation.invalid > 0 || importing}
                    >
                        {importing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Import {validation?.valid || 0} Users
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

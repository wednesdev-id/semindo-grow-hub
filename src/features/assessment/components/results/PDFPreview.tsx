import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFPreviewProps {
    onDownload: () => void;
    onPreview?: () => void;
    isGenerating: boolean;
    className?: string;
}

export default function PDFPreview({ onDownload, onPreview, isGenerating, className }: PDFPreviewProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Laporan Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                        Unduh laporan lengkap hasil assessment Anda dalam format PDF.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                    {onPreview && (
                        <Button
                            variant="outline"
                            onClick={onPreview}
                            disabled={isGenerating}
                            className="w-full sm:w-auto"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Pratinjau
                        </Button>
                    )}
                    <Button
                        onClick={onDownload}
                        disabled={isGenerating}
                        className="w-full sm:w-auto"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Memproses...</span>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Unduh PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

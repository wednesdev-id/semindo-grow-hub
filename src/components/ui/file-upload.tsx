import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onUpload?: (file: File) => Promise<void>
    onFileSelect?: (file: File) => void
    selectedFile?: File | null
    accept?: string
    maxSize?: number // in MB
    label?: string
    value?: string | null // URL of uploaded file
    onDelete?: () => void
    disabled?: boolean
}

export function FileUpload({
    onUpload,
    onFileSelect,
    selectedFile,
    accept = 'image/*,application/pdf',
    maxSize = 5,
    label = 'Upload File',
    value,
    onDelete,
    disabled = false
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size exceeds ${maxSize}MB limit`)
            return
        }

        setError(null)

        if (onFileSelect) {
            onFileSelect(file)
            if (inputRef.current) {
                inputRef.current.value = ''
            }
            return
        }

        if (onUpload) {
            setUploading(true)
            try {
                await onUpload(file)
            } catch (err: any) {
                setError(err.message || 'Upload failed')
            } finally {
                setUploading(false)
                // Reset input
                if (inputRef.current) {
                    inputRef.current.value = ''
                }
            }
        }
    }

    if (value || selectedFile) {
        return (
            <div className="relative flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                        {selectedFile ? selectedFile.name : value?.split('/').pop()}
                    </p>
                    <p className="text-xs text-success flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {selectedFile ? 'Selected' : 'Uploaded'}
                    </p>
                </div>
                {onDelete && !disabled && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 transition hover:bg-muted",
                    disabled && "cursor-not-allowed opacity-50",
                    error && "border-destructive/50 bg-destructive/5"
                )}
            >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                    {uploading ? (
                        <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                        {uploading ? 'Uploading...' : label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Max {maxSize}MB (PDF, JPG, PNG)
                    </p>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                />
            </div>
            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, AlertCircle, FileVideo, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import { lmsService } from '@/services/lmsService';

interface MaterialUploaderProps {
    onUploadComplete: (url: string, type: 'pdf' | 'video' | 'slide') => void;
    accept?: string;
    maxSizeMB?: number; // Default 50MB
    label?: string;
}

export default function MaterialUploader({
    onUploadComplete,
    accept = "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/mp4",
    maxSizeMB = 50,
    label = "Upload Material"
}: MaterialUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file: File) => {
        // Check size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMB}MB`);
            return false;
        }

        // Check type (basic check based on accept prop)
        // Note: strict MIME type checking is complex, this is a simple validation
        if (accept && !accept.split(',').some(type => {
            const trimmed = type.trim();
            if (trimmed.endsWith('/*')) {
                return file.type.startsWith(trimmed.replace('/*', ''));
            }
            return file.type === trimmed;
        })) {
            // Allow relaxed check for PowerPoint as MIME types can vary
            if ((file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) && accept.includes('presentation')) {
                return true;
            }
            setError("File type not supported");
            return false;
        }

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError(null);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setError(null);
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        if (!validateFile(file)) return;

        setIsUploading(true);
        setProgress(0);

        try {
            // Simulate progress since XHR progress isn't directly exposed in common simple fetch wrappers
            // In a real app with axios/xhr, we'd hook into onUploadProgress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            let type: 'pdf' | 'video' | 'slide' = 'pdf';
            if (file.type.includes('video')) type = 'video';
            else if (file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) type = 'slide';

            console.log('Uploading file:', file.name, type);

            // Use lmsService to upload
            const response = await lmsService.uploadResource(file);

            clearInterval(progressInterval);
            setProgress(100);

            toast.success("File uploaded successfully");
            onUploadComplete(response.url, type);

        } catch (err) {
            console.error("Upload failed", err);
            setError("Upload failed. Please try again.");
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors
                    ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'}
                    ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="w-full max-w-xs space-y-4">
                        <div className="flex items-center justify-center text-primary animate-bounce">
                            <Upload className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Uploading...</p>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-center gap-2 text-gray-400">
                            <FileText className="h-8 w-8" />
                            <Presentation className="h-8 w-8" />
                            <FileVideo className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {dragActive ? "Drop the file here" : label}
                            </p>
                            <p className="text-xs text-gray-500">
                                Drag & drop or click to browse
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onButtonClick}
                            className="mt-2"
                        >
                            Select File
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-1 hover:underline">Dismiss</button>
                    </div>
                )}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400 px-1">
                <span>Supported: PDF, PPT, Video (MP4)</span>
                <span>Max: {maxSizeMB}MB</span>
            </div>
        </div>
    );
}

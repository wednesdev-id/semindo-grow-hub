import { AlertCircle, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Terjadi Kesalahan",
    message = "Gagal memuat data. Silakan coba lagi.",
    onRetry,
    className,
}: ErrorStateProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (message) {
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={cn("flex min-h-[400px] flex-col items-center justify-center p-4 text-center", className)}>
            <div className="mb-4 rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
            <div className="relative mb-6 max-w-md rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground break-words">{message}</p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background shadow-sm hover:bg-accent"
                    onClick={handleCopy}
                    title="Salin pesan error"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Coba Lagi
                </Button>
            )}
        </div>
    );
}

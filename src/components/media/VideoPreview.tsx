import { extractYouTubeId, extractVimeoId, getYouTubeEmbedUrl, getVimeoEmbedUrl, getYouTubeThumbnail } from "@/lib/videoUtils";

interface VideoPreviewProps {
    url: string;
    className?: string;
}

export function VideoPreview({ url, className = "" }: VideoPreviewProps) {
    const youtubeId = extractYouTubeId(url);
    const vimeoId = extractVimeoId(url);

    if (youtubeId) {
        return (
            <div className={`relative w-full ${className}`}>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                        src={getYouTubeEmbedUrl(youtubeId)}
                        title="YouTube video preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">YouTube Video ID: {youtubeId}</p>
            </div>
        );
    }

    if (vimeoId) {
        return (
            <div className={`relative w-full ${className}`}>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                        src={getVimeoEmbedUrl(vimeoId)}
                        title="Vimeo video preview"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Vimeo Video ID: {vimeoId}</p>
            </div>
        );
    }

    // If URL is provided but not YouTube or Vimeo, show generic video player
    if (url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('blob:'))) {
        return (
            <div className={`relative w-full ${className}`}>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                        src={url}
                        controls
                        className="w-full h-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Uploaded Video</p>
            </div>
        );
    }

    // No valid video URL
    return (
        <div className={`relative w-full ${className}`}>
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No video to preview</p>
            </div>
        </div>
    );
}

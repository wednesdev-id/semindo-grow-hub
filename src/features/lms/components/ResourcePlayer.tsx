import React from 'react';
import { CustomYouTubePlayer } from './CustomYouTubePlayer';

interface ResourcePlayerProps {
    type: string; // video, pdf, slide, link, article
    url?: string | null;
    content?: string | null;
    title?: string;
}

// Helper function to check if URL is a YouTube URL
const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
};

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
};

export const ResourcePlayer: React.FC<ResourcePlayerProps> = ({ type, url, content, title }) => {
    if (type === 'video' && url) {
        // Check if it's a YouTube URL
        if (isYouTubeUrl(url)) {
            const videoId = getYouTubeVideoId(url);
            if (videoId) {
                return <CustomYouTubePlayer videoId={videoId} title={title} />;
            }
        }

        // For non-YouTube videos (direct video files)
        return (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                    src={url}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    if ((type === 'pdf' || type === 'slide') && url) {
        return (
            <div className="w-full h-[800px] border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <iframe
                    src={url}
                    className="w-full h-full"
                    title={title || 'Document Viewer'}
                />
            </div>
        );
    }

    if (type === 'article' && content) {
        return (
            <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        );
    }

    if (type === 'link' && url) {
        return (
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-1">{title || 'External Resource'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{url}</p>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
                >
                    Open Link
                </a>
            </div>
        );
    }

    return (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
            <p>Unsupported resource type or missing content.</p>
        </div>
    );
};

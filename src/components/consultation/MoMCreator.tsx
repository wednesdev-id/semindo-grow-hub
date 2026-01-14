import { useState } from 'react';
import { consultationService } from '@/services/consultationService';
import { Upload, Loader2, FileAudio, Video, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MoMCreatorProps {
    requestId: string;
    onSuccess: () => void;
}

export function MoMCreator({ requestId, onSuccess }: MoMCreatorProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showVideoGuide, setShowVideoGuide] = useState(false);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 200MB for video support)
            if (file.size > 200 * 1024 * 1024) {
                toast({
                    title: 'File terlalu besar',
                    description: 'Maksimal ukuran file adalah 200MB',
                    variant: 'destructive'
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);

            // Show converting message if video
            const isVideo = selectedFile.type.startsWith('video');
            if (isVideo) {
                toast({
                    title: 'Mengonversi video...',
                    description: 'Video sedang dikonversi ke audio. Ini mungkin memakan waktu 1-2 menit.',
                });
            }

            // Create MoM
            const minutes = await consultationService.createMinutes(requestId);

            // Upload audio/video
            await consultationService.uploadAudioForMoM(minutes.data.id, selectedFile);

            toast({
                title: isVideo ? 'Video berhasil dikonversi & diupload' : 'Audio berhasil diupload',
                description: 'Sedang diproses oleh AI, mohon tunggu beberapa menit...'
            });

            onSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload gagal',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
        }
    };

    const isVideo = selectedFile?.type.startsWith('video');

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Buat Notulensi (MoM)</h3>

            <div className="space-y-4">
                {/* Video Guide Toggle */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <button
                        onClick={() => setShowVideoGuide(!showVideoGuide)}
                        className="flex items-center gap-2 text-sm text-blue-800 font-medium hover:text-blue-900"
                    >
                        <Info className="w-4 h-4" />
                        Cara merekam & upload video conference
                        {showVideoGuide ? ' ▲' : ' ▼'}
                    </button>

                    {showVideoGuide && (
                        <div className="mt-3 text-sm text-blue-700 space-y-3">
                            <div>
                                <p className="font-medium">📹 Cara Rekam Zoom/Google Meet:</p>
                                <ol className="ml-4 list-decimal space-y-1">
                                    <li>Mulai recording di Zoom/Google Meet</li>
                                    <li>Selesaikan sesi konsultasi</li>
                                    <li>Download file video (MP4)</li>
                                    <li>Upload video di sini (akan otomatis dikonversi ke audio)</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium">💾 Hemat Storage:</p>
                                <p className="ml-4">Video akan otomatis dikonversi ke audio MP3 untuk hemat storage (90% lebih kecil)</p>
                            </div>
                            <div>
                                <p className="font-medium">⚡ Tips:</p>
                                <ul className="ml-4 list-disc space-y-1">
                                    <li>Upload audio langsung untuk proses lebih cepat</li>
                                    <li>Upload video jika Anda tidak punya file audio</li>
                                    <li>Proses konversi video: ~1-2 menit</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Upload Rekaman Konsultasi
                    </label>
                    <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="audio-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="audio-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        {selectedFile?.type.startsWith('video') ? (
                            <Video className="w-5 h-5 text-purple-500" />
                        ) : (
                            <FileAudio className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : 'Pilih file audio atau video (MP3, MP4, WAV, dll)'}
                        </span>
                    </label>
                    {selectedFile && (
                        <p className="text-xs text-gray-500 mt-1">
                            Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            {isVideo && ' (video - akan dikonversi ke audio)'}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isVideo ? 'Mengonversi & Memproses...' : 'Memproses...'}
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload & Proses dengan AI
                        </>
                    )}
                </button>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800">
                        💡 <strong>Auto-Conversion:</strong> Upload video (Zoom/Meet recording) akan otomatis dikonversi ke audio.
                        Proses AI memakan waktu 2-5 menit tergantung durasi.
                    </p>
                </div>
            </div>
        </div>
    );
}

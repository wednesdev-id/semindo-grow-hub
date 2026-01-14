import { useState, useEffect } from 'react';
import { consultationService } from '@/services/consultationService';
import type { ConsultationMinutes } from '@/types/consultation';
import { Loader2, Save, Send, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MoMEditorProps {
    requestId: string;
    onPublish: () => void;
}

export function MoMEditor({ requestId, onPublish }: MoMEditorProps) {
    const [minutes, setMinutes] = useState<ConsultationMinutes | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const { toast } = useToast();

    const [summary, setSummary] = useState('');
    const [recommendations, setRecommendations] = useState('');

    useEffect(() => {
        loadMinutes();

        // Poll for processing status
        const interval = setInterval(() => {
            if (minutes?.status === 'processing') {
                loadMinutes();
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [requestId]);

    const loadMinutes = async () => {
        try {
            const data = await consultationService.getMinutes(requestId);
            if (data.data) {
                setMinutes(data.data);
                setSummary(data.data.summary || '');
                setRecommendations(data.data.recommendations || '');
            }
        } catch (error) {
            console.error('Failed to load MoM:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!minutes) return;

        try {
            setSaving(true);
            await consultationService.updateMinutes(minutes.id, {
                summary,
                recommendations
            });

            toast({
                title: 'Tersimpan',
                description: 'Perubahan berhasil disimpan'
            });
        } catch (error) {
            toast({
                title: 'Gagal menyimpan',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!minutes) return;

        try {
            setPublishing(true);
            await consultationService.publishMinutes(minutes.id);

            toast({
                title: 'Notulensi dipublikasi',
                description: 'Klien sekarang dapat melihat notulensi konsultasi'
            });

            onPublish();
        } catch (error) {
            toast({
                title: 'Gagal mempublikasi',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            });
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!minutes) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">Notulensi belum dibuat untuk konsultasi ini.</p>
            </div>
        );
    }

    if (minutes.status === 'processing') {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-blue-800 font-medium">Sedang memproses audio dengan AI...</p>
                <p className="text-xs text-blue-600 mt-1">Mohon tunggu 2-5 menit</p>
            </div>
        );
    }

    if (minutes.status === 'queued') {
        return (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-purple-800 font-medium">Video sedang diproses dalam antrian...</p>
                <p className="text-xs text-purple-600 mt-1">Estimasi waktu: 5-10 menit. Anda akan mendapat notifikasi saat selesai.</p>
            </div>
        );
    }

    if (minutes.processingError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Gagal memproses audio</p>
                        <p className="text-xs text-red-600 mt-1">{minutes.processingError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Notulensi Konsultasi</h3>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan Draft
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={publishing || minutes.status === 'published'}
                        className="flex items-center gap-2"
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {minutes.status === 'published' ? 'Sudah Dipublikasi' : 'Publikasi'}
                    </Button>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={
                    minutes.status === 'published' ? 'default' :
                    minutes.status === 'ready' ? 'secondary' :
                    'outline'
                }>
                    {minutes.status === 'published' ? 'Dipublikasi' :
                     minutes.status === 'ready' ? 'Siap Dipublikasi' :
                     minutes.status}
                </Badge>
            </div>

            {/* Transcript (Read-only) */}
            {minutes.transcript && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Transkrip Lengkap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
                            {minutes.transcript}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary (Editable) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ringkasan Konsultasi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Ringkasan konsultasi..."
                        rows={8}
                        className="min-h-[200px]"
                    />
                </CardContent>
            </Card>

            {/* Key Points (Read-only) */}
            {minutes.keyPoints && minutes.keyPoints.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Poin Kunci</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            {minutes.keyPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Action Items (Read-only) */}
            {minutes.actionItems && minutes.actionItems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Action Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {minutes.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    <Badge variant={
                                        item.priority === 'high' ? 'destructive' :
                                        item.priority === 'medium' ? 'default' :
                                        'secondary'
                                    } className="mt-0.5">
                                        {item.priority}
                                    </Badge>
                                    <span className="text-gray-700">{item.task}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations (Editable) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Rekomendasi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Rekomendasi untuk klien..."
                        rows={6}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { assessmentService } from '../services/assessmentService';

export const usePDFGeneration = () => {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async (assessmentId: string) => {
        setIsGenerating(true);
        try {
            // Assuming assessmentService has a method for this, or we use a direct fetch
            // If assessmentService doesn't have it, we might need to add it or use fetch directly.
            // Let's assume we need to add it to assessmentService or use a generic api call.
            // For now, I'll use a placeholder implementation that simulates the call or calls a hypothetical method.

            // In a real app, this would likely return a Blob or a URL.
            // Let's assume the backend returns a blob.

            // Check if assessmentService has downloadReport. If not, we might need to add it.
            // I'll assume it exists or I will add it later.
            // For now, I'll use a direct fetch approach here to be safe if service is missing it.

            const response = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/report`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust auth as needed
                },
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `assessment-report-${assessmentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Berhasil",
                description: "Laporan PDF berhasil diunduh.",
            });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast({
                title: "Gagal",
                description: "Gagal mengunduh laporan PDF.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generatePDF,
        isGenerating
    };
};

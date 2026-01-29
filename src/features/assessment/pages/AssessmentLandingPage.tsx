import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AssessmentLandingPage() {
    const navigate = useNavigate();
    const { toast } = useToast();



    const createAssessmentMutation = useMutation({
        mutationFn: assessmentService.createAssessment,
        onSuccess: (data) => {
            toast({
                title: "Asesmen Dimulai",
                description: "Anda akan diarahkan ke halaman asesmen.",
            });
            navigate(`/assessment/${data.id}`);
        },
        onError: (error: any) => {
            toast({
                title: "Gagal Memulai Asesmen",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleStartAssessment = (templateId: string) => {
        createAssessmentMutation.mutate(templateId);
    };



    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold">Assessment Page (Legacy)</h1>
            <p>Please use the Self Assessment page.</p>
        </div>
    );
}

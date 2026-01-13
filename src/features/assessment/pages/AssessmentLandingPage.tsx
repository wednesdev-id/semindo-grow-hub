import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AssessmentLandingPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: templates, isLoading } = useQuery({
        queryKey: ['assessment-templates'],
        queryFn: assessmentService.getTemplates
    });

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Self-Assessment UMKM</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                    Ukur kesiapan dan level bisnis Anda melalui asesmen komprehensif kami. Dapatkan rekomendasi yang dipersonalisasi untuk mengembangkan usaha Anda.
                </p>
                <Button variant="outline" onClick={() => navigate('/assessment/history')}>
                    Lihat Riwayat Asesmen
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((template) => (
                    <Card key={template.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">{template.title}</CardTitle>
                            <CardDescription>{template.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {template.description || "Evaluasi komprehensif untuk bisnis Anda."}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>{template._count?.questions || 0} Pertanyaan</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full group"
                                onClick={() => handleStartAssessment(template.id)}
                                disabled={createAssessmentMutation.isPending}
                            >
                                {createAssessmentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Mulai Asesmen
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {templates?.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500">Belum ada template asesmen yang tersedia saat ini.</p>
                </div>
            )}
        </div>
    );
}

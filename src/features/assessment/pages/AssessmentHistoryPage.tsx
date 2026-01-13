import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Award, ArrowRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AssessmentHistoryPage() {
    const { data: assessments, isLoading } = useQuery({
        queryKey: ['my-assessments'],
        queryFn: assessmentService.getMyAssessments
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Riwayat Asesmen</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Lihat perjalanan dan perkembangan bisnis Anda dari waktu ke waktu.
                    </p>
                </div>
                <Link to="/assessment">
                    <Button>
                        Mulai Asesmen Baru
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {assessments?.map((assessment) => (
                    <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-semibold text-primary">
                                            {assessment.template?.title || 'Self-Assessment UMKM'}
                                        </h3>
                                        <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                                            {assessment.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {format(new Date(assessment.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                                            </span>
                                        </div>
                                        {assessment.score && (
                                            <div className="flex items-center gap-1">
                                                <Award className="h-4 w-4" />
                                                <span>Skor: {assessment.score.totalScore}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {assessment.status === 'completed' ? (
                                        <Link to={`/assessment/results/${assessment.id}`}>
                                            <Button variant="outline" className="gap-2">
                                                Lihat Hasil
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link to={`/assessment/${assessment.id}`}>
                                            <Button className="gap-2">
                                                Lanjutkan
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {assessments?.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Belum ada riwayat asesmen</h3>
                        <p className="text-gray-500 mb-6">Mulai asesmen pertama Anda untuk mengetahui kesehatan bisnis Anda.</p>
                        <Link to="/assessment">
                            <Button>Mulai Asesmen Sekarang</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Link, useParams } from 'react-router-dom'
import ScoreVisualization from '../components/results/ScoreVisualization'
import RecommendationList from '../components/results/RecommendationList'
import ProblemMappingView from '../components/results/ProblemMappingView'
import PDFPreview from '../components/results/PDFPreview'
import UMKMLevelBadge from '../components/shared/UMKMLevelBadge'
import { AssessmentScore, Recommendation } from '../types'
import { useAssessment } from '../hooks/useAssessment'
import { usePDFGeneration } from '../hooks/usePDFGeneration'
import { Button } from '@/components/ui/button'
import { Share2, ArrowLeft } from 'lucide-react'

export default function AssessmentResultsPage() {
    const { id } = useParams<{ id: string }>()
    const { assessment, isLoadingAssessment, assessmentError } = useAssessment(id)
    const { generatePDF, isGenerating } = usePDFGeneration()

    if (isLoadingAssessment) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat hasil analisis...</p>
                </div>
            </div>
        )
    }

    if (assessmentError || !assessment) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Data tidak ditemukan atau terjadi kesalahan.</p>
                    <Link to="/dashboard" className="mt-4 text-primary hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Map backend data to frontend types
    const backendScore = (assessment as any).score || {}
    const categoryScoresObj = backendScore.categoryScores || {}

    const mappedCategoryScores: Record<string, { name: string, score: number, maxScore: number }> = {};
    Object.values(categoryScoresObj).forEach((cs: any) => {
        mappedCategoryScores[cs.name] = {
            name: cs.name,
            score: cs.score,
            maxScore: cs.maxScore
        };
    });

    const score: AssessmentScore = {
        id: assessment.id,
        totalScore: Number(backendScore.totalScore) || 0,
        umkmLevel: (backendScore.umkmLevel || 'Mikro').toLowerCase() as 'mikro' | 'kecil' | 'menengah',
        categoryScores: mappedCategoryScores
    }

    const recommendations: Recommendation[] = ((assessment as any).recommendations || []).map((rec: any) => ({
        id: rec.id,
        assessment_id: rec.assessmentId,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        category: rec.category,
        action_items: rec.actionItems || [],
        resources: rec.resources || [],
        estimated_time: '1-2 minggu', // Placeholder
        estimated_cost: 'Bervariasi' // Placeholder
    }))

    // Placeholder for problems (if backend doesn't return them yet in the main object)
    // Assuming assessment.problems exists or we derive it. 
    // If not available, we pass empty array or mock it for now.
    const problems = (assessment as any).problems || [];

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-soft">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    Assessment Complete! 🎉
                                </h1>
                                <UMKMLevelBadge level={score.umkmLevel} size="lg" className="bg-white/20 text-white border-white/30" />
                            </div>
                            <p className="text-white/90">
                                Berikut adalah hasil analisis kesehatan bisnis Anda
                            </p>
                        </div>
                        <Link
                            to="/assessment/history"
                            className="inline-flex items-center justify-center rounded-md bg-white/20 px-4 py-2 font-medium text-white transition-colors hover:bg-white/30"
                        >
                            Riwayat Assessment
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column: Score, Actions, PDF */}
                    <div className="space-y-6 lg:col-span-4">
                        <ScoreVisualization score={score} />

                        <PDFPreview
                            onDownload={() => generatePDF(assessment.id)}
                            isGenerating={isGenerating}
                        />

                        <div className="space-y-3">
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Dashboard
                                </Link>
                            </Button>

                            <Button variant="ghost" className="w-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Bagikan Hasil
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Problems, Recommendations, Next Steps */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Problems Section */}
                        <ProblemMappingView problems={problems} />

                        {/* Recommendations Section */}
                        <RecommendationList recommendations={recommendations} />

                        {/* Next Steps */}
                        <div className="rounded-lg bg-card p-6 shadow-sm border">
                            <h3 className="mb-4 text-xl font-semibold text-foreground">
                                Langkah Selanjutnya
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Link
                                    to="/lms"
                                    className="group rounded-lg border p-4 transition-colors hover:border-primary hover:bg-accent"
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h4 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                                        Mulai Belajar
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Akses kursus gratis sesuai rekomendasi
                                    </p>
                                </Link>

                                <Link
                                    to="/consultation"
                                    className="group rounded-lg border p-4 transition-colors hover:border-primary hover:bg-accent"
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h4 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                                        Konsultasi Bisnis
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Diskusi dengan konsultan ahli
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

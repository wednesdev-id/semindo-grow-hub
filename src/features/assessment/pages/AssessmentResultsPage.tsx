import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ScoreVisualization from '../components/results/ScoreVisualization'
import RecommendationList from '../components/results/RecommendationList'
import { AssessmentScore, Recommendation } from '../types'
import { useToast } from '@/components/ui/use-toast'

export default function AssessmentResultsPage() {
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const [score, setScore] = useState<AssessmentScore | null>(null)
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/v1/assessment/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!res.ok) throw new Error('Failed to fetch results')

                const data = await res.json()
                const assessment = data.data

                // Map backend score to frontend AssessmentScore
                const backendScore = assessment.score || {}
                const categoryScoresObj = backendScore.categoryScores || {}

                const mappedCategoryScores = Object.values(categoryScoresObj).map((cs: any) => ({
                    category: cs.name,
                    score: cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0,
                    weight: 1, // Placeholder as backend doesn't return weight per category in score yet
                    questions_count: 0 // Placeholder
                }))

                const mappedScore: AssessmentScore = {
                    id: assessment.id,
                    assessment_id: assessment.id,
                    total_score: Number(backendScore.totalScore) || 0, // Assuming totalScore is raw score, need percentage? 
                    // Actually backend totalScore seems to be raw. We might need a global max score or just use it if it's already 0-100.
                    // Looking at previous logs, totalScore was "20". If max is not known, this might be an issue.
                    // However, for now let's assume the backend might return a percentage or we treat it as is.
                    // Wait, the backend logic: const finalScore = (totalScore / maxPossibleScore) * 100. 
                    // So backendScore.totalScore IS the percentage (0-100).
                    umkm_level: (backendScore.umkmLevel || 'Mikro').toLowerCase(),
                    confidence_score: Number(backendScore.confidenceScore) || 0.9,
                    calculated_at: new Date(backendScore.calculatedAt || assessment.updatedAt),
                    category_scores: mappedCategoryScores
                }

                setScore(mappedScore)

                // Map recommendations
                const mappedRecommendations: Recommendation[] = (assessment.recommendations || []).map((rec: any) => ({
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

                setRecommendations(mappedRecommendations)

            } catch (error) {
                console.error('Error fetching results:', error)
                toast({
                    title: "Error",
                    description: "Gagal memuat hasil assessment.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchResults()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat hasil analisis...</p>
                </div>
            </div>
        )
    }

    if (!score) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Data tidak ditemukan.</p>
                    <Link to="/dashboard" className="mt-4 text-primary hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-soft">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold">
                                Assessment Complete! 🎉
                            </h1>
                            <p className="text-white/90">
                                Berikut adalah hasil analisis kesehatan bisnis Anda
                            </p>
                        </div>
                        <Link
                            to="/assessment/history"
                            className="rounded-md bg-white/20 px-4 py-2 font-medium text-white transition-colors hover:bg-white/30"
                        >
                            Riwayat Assessment
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Score Visualization */}
                    <div className="lg:col-span-4">
                        <ScoreVisualization score={score} />

                        {/* Actions */}
                        <div className="mt-6 space-y-3">
                            <Link
                                to="/dashboard"
                                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Kembali ke Dashboard
                            </Link>

                            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Laporan PDF
                            </button>

                            <button className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-transparent px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-muted">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Bagikan Hasil
                            </button>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="lg:col-span-8">
                        <RecommendationList recommendations={recommendations} />

                        {/* Next Steps */}
                        <div className="mt-6 rounded-lg bg-white p-6 shadow-soft dark:bg-card">
                            <h3 className="mb-4 text-xl font-semibold text-foreground">
                                Langkah Selanjutnya
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Link
                                    to="/lms"
                                    className="group rounded-lg border-2 border-border p-4 transition-colors hover:border-primary"
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success bg-opacity-10">
                                        <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    className="group rounded-lg border-2 border-border p-4 transition-colors hover:border-primary"
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning bg-opacity-10">
                                        <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import QuestionCard from '../components/forms/QuestionCard'
import MultipleChoiceQuestion from '../components/forms/question-types/MultipleChoiceQuestion'
import ScaleQuestion from '../components/forms/question-types/ScaleQuestion'
import BooleanQuestion from '../components/forms/question-types/BooleanQuestion'
import TextInputQuestion from '../components/forms/question-types/TextInputQuestion'
import ProgressIndicator from '../components/shared/ProgressIndicator'
import { AnswerValue } from '../types'
import { assessmentService } from '../services/assessmentService'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function AssessmentWizardPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, AnswerValue>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    const { data: assessment, isLoading, error } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => assessmentService.getAssessment(id!),
        enabled: !!id
    })

    const sections = assessment?.template?.questions
        ? Object.values(assessment.template.questions.reduce((acc: any, q: any) => {
            const category = q.category.name
            if (!acc[category]) {
                acc[category] = {
                    id: q.category.id,
                    title: category,
                    questions: []
                }
            }
            acc[category].questions.push(q)
            return acc
        }, {})) as any[]
        : []

    // Initialize responses from existing assessment data
    useEffect(() => {
        if (assessment?.responses) {
            const initialResponses: Record<string, AnswerValue> = {}
            assessment.responses.forEach((r: any) => {
                initialResponses[r.questionId] = r.answerValue
            })
            setResponses(initialResponses)
        }
    }, [assessment])

    const saveResponseMutation = useMutation({
        mutationFn: ({ questionId, value }: { questionId: string, value: AnswerValue }) =>
            assessmentService.saveResponse(assessment.id, questionId, value)
    })

    const submitAssessmentMutation = useMutation({
        mutationFn: () => assessmentService.submitAssessment(assessment.id),
        onSuccess: () => {
            navigate(`/assessment/results/${assessment.id}`)
        },
        onError: (error: any) => {
            toast({
                title: "Gagal mengirim",
                description: error.message || "Terjadi kesalahan saat mengirim assessment.",
                variant: "destructive"
            })
        }
    })

    const currentSection = sections[currentSectionIndex]
    const sectionTitles = sections.map(s => s.title)

    const handleAnswerChange = (questionId: string, value: AnswerValue) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }))

        // Clear error
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }

        // Auto-save
        if (assessment) {
            saveResponseMutation.mutate({ questionId, value })
        }
    }

    const validateSection = () => {
        const newErrors: Record<string, string> = {}

        if (currentSection) {
            currentSection.questions.forEach((question: any) => {
                if (!responses[question.id]) {
                    newErrors[question.id] = 'Pertanyaan ini wajib diisi'
                }
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (!validateSection()) {
            toast({
                title: "Mohon lengkapi jawaban",
                description: "Masih ada pertanyaan yang belum dijawab di bagian ini.",
                variant: "destructive"
            })
            return
        }

        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            submitAssessmentMutation.mutate()
        }
    }

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const renderQuestion = (question: any) => {
        const value = responses[question.id]
        const error = errors[question.id]

        const questionInput = (() => {
            switch (question.type) {
                case 'multiple_choice':
                    return (
                        <MultipleChoiceQuestion
                            question={question}
                            value={value as string | string[]}
                            onChange={(val) => handleAnswerChange(question.id, val)}
                            multiSelect={false}
                        />
                    )
                case 'scale':
                    return (
                        <ScaleQuestion
                            question={question}
                            value={value as number || 1}
                            onChange={(val) => handleAnswerChange(question.id, val)}
                        />
                    )
                case 'boolean':
                    return (
                        <BooleanQuestion
                            value={value as boolean}
                            onChange={(val) => handleAnswerChange(question.id, val)}
                        />
                    )
                case 'text':
                    return (
                        <TextInputQuestion
                            value={(value as string) || ''}
                            onChange={(val) => handleAnswerChange(question.id, val)}
                            multiline={true}
                            maxLength={500}
                        />
                    )
                default:
                    return null
            }
        })()

        return (
            <QuestionCard
                key={question.id}
                question={question}
                value={value}
                onChange={(val) => handleAnswerChange(question.id, val)}
                error={error}
            >
                {questionInput}
            </QuestionCard>
        )
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !assessment) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Gagal memuat data assessment.</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
                        Coba lagi
                    </button>
                </div>
            </div>
        )
    }

    if (sections.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Template assessment tidak memiliki pertanyaan.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-soft dark:bg-card">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">
                        {assessment.template?.title}
                    </h1>
                    <p className="text-muted-foreground">
                        {assessment.template?.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Progress Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6">
                            <ProgressIndicator
                                currentSection={currentSectionIndex + 1}
                                totalSections={sections.length}
                                sectionTitles={sectionTitles}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="lg:col-span-8">
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="rounded-lg bg-white p-6 shadow-soft dark:bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <span className="font-semibold">{currentSectionIndex + 1}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {currentSection.title}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Bagian {currentSectionIndex + 1} dari {sections.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            {currentSection.questions.map(renderQuestion)}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between gap-4 rounded-lg bg-white p-6 shadow-soft dark:bg-card">
                                <button
                                    onClick={handleBack}
                                    disabled={currentSectionIndex === 0}
                                    className="flex items-center gap-2 rounded-md bg-muted px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Kembali
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={submitAssessmentMutation.isPending}
                                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
                                >
                                    {submitAssessmentMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : currentSectionIndex === sections.length - 1 ? (
                                        <>
                                            Kirim Jawaban
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            Lanjut
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

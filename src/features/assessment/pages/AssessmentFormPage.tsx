import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionCard from '../components/forms/QuestionCard'
import MultipleChoiceQuestion from '../components/forms/question-types/MultipleChoiceQuestion'
import ScaleQuestion from '../components/forms/question-types/ScaleQuestion'
import BooleanQuestion from '../components/forms/question-types/BooleanQuestion'
import TextInputQuestion from '../components/forms/question-types/TextInputQuestion'
import ProgressIndicator from '../components/shared/ProgressIndicator'
import { AssessmentQuestion, AnswerValue } from '../types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export default function AssessmentFormPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, AnswerValue>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [assessment, setAssessment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sections, setSections] = useState<any[]>([])

    useEffect(() => {
        const initAssessment = async () => {
            try {
                const token = localStorage.getItem('auth_token')
                // Create new assessment or get existing draft
                // For now, we always create new or get the latest draft
                // Ideally we should check if there is an active draft first
                const res = await fetch('/api/v1/assessment', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })

                if (!res.ok) throw new Error('Failed to initialize assessment')

                const data = await res.json()
                setAssessment(data.data)

                // Group questions by category to form sections
                const questions = data.data.template.questions
                const grouped = questions.reduce((acc: any, q: any) => {
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
                }, {})

                setSections(Object.values(grouped))

                // Load existing responses if any (for draft)
                // TODO: Map existing responses to state

            } catch (error) {
                console.error('Error initializing assessment:', error)
                toast({
                    title: "Error",
                    description: "Gagal memuat assessment. Silakan coba lagi.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        initAssessment()
    }, [])

    const currentSection = sections[currentSectionIndex]
    const sectionTitles = sections.map(s => s.title)

    const handleAnswerChange = async (questionId: string, value: AnswerValue) => {
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

        // Auto-save to backend
        try {
            const token = localStorage.getItem('auth_token')
            await fetch(`/api/v1/assessment/${assessment.id}/responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionId,
                    answerValue: value
                })
            })
        } catch (error) {
            console.error('Failed to save response:', error)
        }
    }

    const validateSection = () => {
        const newErrors: Record<string, string> = {}

        // Simple validation: check if required (assuming all are required for now)
        currentSection.questions.forEach((question: any) => {
            if (!responses[question.id]) {
                newErrors[question.id] = 'Pertanyaan ini wajib diisi'
            }
        })

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
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const res = await fetch(`/api/v1/assessment/${assessment.id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) throw new Error('Failed to submit')

            navigate(`/assessment/results/${assessment.id}`)
        } catch (error) {
            console.error('Submit error:', error)
            toast({
                title: "Gagal mengirim",
                description: "Terjadi kesalahan saat mengirim assessment.",
                variant: "destructive"
            })
        }
    }

    const renderQuestion = (question: any) => {
        const value = responses[question.id]
        const error = errors[question.id]

        const questionInput = (() => {
            // Map backend types to frontend components
            // Backend types: multiple_choice, scale, boolean, text
            switch (question.type) {
                case 'multiple_choice':
                    return (
                        <MultipleChoiceQuestion
                            question={question}
                            value={value as string | string[]}
                            onChange={(val) => handleAnswerChange(question.id, val)}
                            multiSelect={false} // Assuming single select for now based on seed
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat assessment...</p>
                </div>
            </div>
        )
    }

    if (!assessment || sections.length === 0) {
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

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-soft dark:bg-card">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">
                        {assessment.template.title}
                    </h1>
                    <p className="text-muted-foreground">
                        {assessment.template.description}
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
                                    className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    {currentSectionIndex === sections.length - 1 ? (
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

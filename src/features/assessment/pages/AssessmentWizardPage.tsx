import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import QuestionCard from '../components/forms/QuestionCard'
import MultipleChoiceQuestion from '../components/forms/question-types/MultipleChoiceQuestion'
import ScaleQuestion from '../components/forms/question-types/ScaleQuestion'
import BooleanQuestion from '../components/forms/question-types/BooleanQuestion'
import TextInputQuestion from '../components/forms/question-types/TextInputQuestion'
import ProgressIndicator from '../components/shared/ProgressIndicator'
import { AnswerValue } from '../types'
import { assessmentService } from '../services/assessmentService'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, RotateCcw } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

// Helper to parse condition from question options
const checkCondition = (question: any, allResponses: Record<string, AnswerValue>) => {
    if (!question.options || !question.options.condition) return true;

    const { questionId, operator, value } = question.options.condition;
    const dependentAnswer = allResponses[questionId];

    if (dependentAnswer === undefined) return false;

    switch (operator) {
        case 'equals': return dependentAnswer === value;
        case 'not_equals': return dependentAnswer !== value;
        case 'greater_than': return Number(dependentAnswer) > Number(value);
        case 'less_than': return Number(dependentAnswer) < Number(value);
        case 'contains': return Array.isArray(dependentAnswer) && dependentAnswer.includes(value);
        default: return true;
    }
};

export default function AssessmentWizardPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, AnswerValue>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Auto-save state
    const [pendingSave, setPendingSave] = useState<{ questionId: string, value: AnswerValue } | null>(null);
    const debouncedSave = useDebounce(pendingSave, 1000);

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
            assessmentService.saveResponse(assessment.id, questionId, value),
        onError: () => {
            toast({
                title: "Gagal menyimpan",
                description: "Periksa koneksi internet Anda.",
                variant: "destructive"
            })
        }
    })

    // Effect for debounced auto-save
    useEffect(() => {
        if (debouncedSave && assessment) {
            saveResponseMutation.mutate(debouncedSave);
        }
    }, [debouncedSave]);

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

        // Trigger auto-save via debounce
        setPendingSave({ questionId, value });
    }

    const validateQuestion = (question: any, value: AnswerValue) => {
        // Skip validation if question is hidden
        if (!checkCondition(question, responses)) return null;

        let schema;
        switch (question.type) {
            case 'multiple_choice':
                schema = z.union([z.string(), z.array(z.string())]).refine(val => val.length > 0, "Pilihan wajib dipilih");
                break;
            case 'scale':
                schema = z.number().min(1).max(10);
                break;
            case 'boolean':
                schema = z.boolean();
                break;
            case 'text':
                schema = z.string().min(1, "Jawaban wajib diisi").max(500, "Maksimal 500 karakter");
                break;
            default:
                schema = z.any();
        }

        const result = schema.safeParse(value);
        return result.success ? null : result.error.errors[0].message;
    }

    const validateSection = () => {
        const newErrors: Record<string, string> = {}

        if (currentSection) {
            currentSection.questions.forEach((question: any) => {
                const error = validateQuestion(question, responses[question.id]);
                if (error) {
                    newErrors[question.id] = error;
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

    const handleResetSection = () => {
        if (confirm('Apakah Anda yakin ingin mereset jawaban di bagian ini?')) {
            const newResponses = { ...responses };
            currentSection.questions.forEach((q: any) => {
                delete newResponses[q.id];
            });
            setResponses(newResponses);
            setErrors({});
            toast({
                title: "Bagian direset",
                description: "Jawaban di bagian ini telah dikosongkan."
            });
        }
    }

    const renderQuestion = (question: any) => {
        if (!checkCondition(question, responses)) return null;

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
                                <div className="flex items-center justify-between">
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
                                    <button
                                        onClick={handleResetSection}
                                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                        title="Reset jawaban di bagian ini"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset
                                    </button>
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

                                <div className="flex items-center gap-2">
                                    {saveResponseMutation.isPending && (
                                        <span className="text-sm text-muted-foreground animate-pulse">
                                            Menyimpan...
                                        </span>
                                    )}
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
        </div>
    )
}

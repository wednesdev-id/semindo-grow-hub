import { useParams } from 'react-router-dom'
import QuestionCard from '../components/forms/QuestionCard'
import MultipleChoiceQuestion from '../components/forms/question-types/MultipleChoiceQuestion'
import ScaleQuestion from '../components/forms/question-types/ScaleQuestion'
import BooleanQuestion from '../components/forms/question-types/BooleanQuestion'
import TextInputQuestion from '../components/forms/question-types/TextInputQuestion'
import ProgressIndicator from '../components/shared/ProgressIndicator'
import { Loader2, RotateCcw } from 'lucide-react'
import { useAssessmentForm } from '../hooks/useAssessmentForm'

export default function AssessmentWizardPage() {
    const { id } = useParams<{ id: string }>()

    const {
        assessment,
        isLoading,
        error,
        sections,
        currentSection,
        currentSectionIndex,
        responses,
        errors,
        isSaving,
        isSubmitting,
        handleAnswerChange,
        handleNext,
        handleBack,
        handleResetSection,
        checkCondition
    } = useAssessmentForm(id!)

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

    const sectionTitles = sections.map(s => s.title)

    const renderQuestion = (question: any) => {
        if (!checkCondition(question)) return null;

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
                                    {isSaving && (
                                        <span className="text-sm text-muted-foreground animate-pulse">
                                            Menyimpan...
                                        </span>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
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

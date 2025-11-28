import { ReactNode } from 'react'
import { AssessmentQuestion, AssessmentResponse, AnswerValue } from '@core/assessment/types'

interface QuestionCardProps {
    question: AssessmentQuestion
    value: AnswerValue
    onChange: (value: AnswerValue) => void
    error?: string
    children: ReactNode
}

export default function QuestionCard({
    question,
    value,
    onChange,
    error,
    children
}: QuestionCardProps) {
    return (
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
            {/* Question Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                            {question.title}
                            {question.isRequired && (
                                <span className="ml-1 text-danger">*</span>
                            )}
                        </h3>
                        {question.description && (
                            <p className="text-sm text-body-color dark:text-dark-6">
                                {question.description}
                            </p>
                        )}
                    </div>

                    {/* Weight Indicator */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary bg-opacity-10">
                        <span className="text-xs font-medium text-primary">
                            {question.weight}x
                        </span>
                    </div>
                </div>

                {/* Help Text */}
                {question.helpText && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary bg-opacity-5 p-3">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-body-color dark:text-dark-6">
                            {question.helpText}
                        </p>
                    </div>
                )}
            </div>

            {/* Question Input (passed as children) */}
            <div className="space-y-4">
                {children}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger bg-opacity-10 p-3">
                    <svg className="h-4 w-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-danger">{error}</p>
                </div>
            )}
        </div>
    )
}

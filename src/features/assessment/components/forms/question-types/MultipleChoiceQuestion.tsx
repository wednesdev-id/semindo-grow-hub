import { AssessmentQuestion, QuestionOption } from '@core/assessment/types'

interface MultipleChoiceQuestionProps {
    question: AssessmentQuestion
    value: string | string[]
    onChange: (value: string | string[]) => void
    multiSelect?: boolean
}

export default function MultipleChoiceQuestion({
    question,
    value,
    onChange,
    multiSelect = false
}: MultipleChoiceQuestionProps) {
    const selectedValues = Array.isArray(value) ? value : [value]

    const handleOptionClick = (optionValue: string) => {
        if (multiSelect) {
            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(v => v !== optionValue)
                : [...selectedValues, optionValue]
            onChange(newValues)
        } else {
            onChange(optionValue)
        }
    }

    return (
        <div className="space-y-3">
            {question.options?.map((option) => {
                const isSelected = selectedValues.includes(String(option.value))

                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionClick(String(option.value))}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${isSelected
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-stroke hover:border-primary hover:border-opacity-50 dark:border-dark-3'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Radio/Checkbox Indicator */}
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-${multiSelect ? 'md' : 'full'} border-2 ${isSelected
                                ? 'border-primary bg-primary'
                                : 'border-stroke dark:border-dark-3'
                                }`}>
                                {isSelected && (
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                    </svg>
                                )}
                            </div>

                            {/* Option Label */}
                            <div className="flex-1">
                                <span className={`font-medium ${isSelected ? 'text-dark dark:text-white' : 'text-body-color dark:text-dark-6'
                                    }`}>
                                    {option.text}
                                </span>
                            </div>

                            {/* Score Badge */}
                            {option.score !== undefined && (
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isSelected
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-2 text-body-color dark:bg-dark-3 dark:text-dark-6'
                                    }`}>
                                    {option.score} pts
                                </span>
                            )}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

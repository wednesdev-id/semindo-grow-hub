import { useState } from 'react'
import { AssessmentQuestion, ScaleConfig } from '@core/assessment/types'

interface ScaleQuestionProps {
    question: AssessmentQuestion
    value: number
    onChange: (value: number) => void
}

export default function ScaleQuestion({
    question,
    value,
    onChange
}: ScaleQuestionProps) {
    const config = question.scaleConfig || {
        min: 1,
        max: 5,
        step: 1,
        showNumericValue: true,
        labels: { min: 'Min', max: 'Max' }
    }
    const { min, max, labels, showNumericValue } = config
    const [hoveredValue, setHoveredValue] = useState<number | null>(null)

    const steps = []
    for (let i = min; i <= max; i += config.step) {
        steps.push(i)
    }

    const handleSelect = (val: number) => {
        onChange(val)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                {/* Min Label */}
                <div className="w-24 text-right text-sm font-medium text-body-color dark:text-dark-6">
                    {labels?.min}
                </div>

                {/* Scale Steps */}
                <div className="flex flex-1 items-center justify-between gap-2">
                    {steps.map((step) => {
                        const isSelected = value === step
                        const isHovered = hoveredValue === step

                        return (
                            <button
                                key={step}
                                type="button"
                                onClick={() => handleSelect(step)}
                                onMouseEnter={() => setHoveredValue(step)}
                                onMouseLeave={() => setHoveredValue(null)}
                                className={`group relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isSelected
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-stroke bg-white text-dark hover:border-primary hover:text-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white'
                                    }`}
                            >
                                <span className="text-sm font-semibold">{step}</span>

                                {/* Tooltip for numeric value if needed */}
                                {showNumericValue && (
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-body-color opacity-0 transition-opacity group-hover:opacity-100 dark:text-dark-6">
                                        {step}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Max Label */}
                <div className="w-24 text-left text-sm font-medium text-body-color dark:text-dark-6">
                    {labels?.max}
                </div>
            </div>

            {/* Slider Alternative */}
            <div className="relative">
                <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step || 1}
                    value={value || config.min}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-3 dark:bg-dark-3"
                    style={{
                        background: `linear-gradient(to right, rgb(var(--color-primary)) 0%, rgb(var(--color-primary)) ${((value - config.min) / (config.max - config.min)) * 100}%, rgb(229 231 235) ${((value - config.min) / (config.max - config.min)) * 100}%, rgb(229 231 235) 100%)`
                    }}
                />
            </div>
        </div>
    )
}

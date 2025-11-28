interface BooleanQuestionProps {
    value: boolean
    onChange: (value: boolean) => void
    yesLabel?: string
    noLabel?: string
}

export default function BooleanQuestion({
    value,
    onChange,
    yesLabel = 'Ya',
    noLabel = 'Tidak'
}: BooleanQuestionProps) {
    return (
        <div className="flex gap-4">
            {/* Yes Button */}
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`flex flex-1 items-center justify-center gap-3 rounded-lg border-2 p-6 font-semibold transition-all ${value === true
                        ? 'border-success bg-success text-white shadow-lg'
                        : 'border-stroke text-body-color hover:border-success hover:border-opacity-50 dark:border-dark-3 dark:text-dark-6'
                    }`}
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{yesLabel}</span>
            </button>

            {/* No Button */}
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`flex flex-1 items-center justify-center gap-3 rounded-lg border-2 p-6 font-semibold transition-all ${value === false
                        ? 'border-danger bg-danger text-white shadow-lg'
                        : 'border-stroke text-body-color hover:border-danger hover:border-opacity-50 dark:border-dark-3 dark:text-dark-6'
                    }`}
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{noLabel}</span>
            </button>
        </div>
    )
}

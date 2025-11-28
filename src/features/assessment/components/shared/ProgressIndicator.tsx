interface ProgressIndicatorProps {
    currentSection: number
    totalSections: number
    sectionTitles?: string[]
}

export default function ProgressIndicator({
    currentSection,
    totalSections,
    sectionTitles
}: ProgressIndicatorProps) {
    const progress = (currentSection / totalSections) * 100

    return (
        <div className="rounded-lg bg-white p-6 shadow-soft dark:bg-card">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Progress</h3>
                <span className="text-sm font-medium text-muted-foreground">
                    {currentSection} / {totalSections} Sections
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-3 w-full rounded-full bg-muted">
                    <div
                        className="h-3 rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="mt-2 text-center text-sm font-medium text-primary">
                    {Math.round(progress)}% Complete
                </p>
            </div>

            {/* Section Steps */}
            {sectionTitles && (
                <div className="space-y-3">
                    {sectionTitles.map((title, index) => {
                        const sectionNumber = index + 1
                        const isCompleted = sectionNumber < currentSection
                        const isCurrent = sectionNumber === currentSection
                        const isPending = sectionNumber > currentSection

                        return (
                            <div key={index} className="flex items-center gap-3">
                                {/* Step Circle */}
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium ${isCompleted
                                            ? 'bg-success text-success-foreground'
                                            : isCurrent
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <span className="text-sm">{sectionNumber}</span>
                                    )}
                                </div>

                                {/* Step Title */}
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-medium ${isCompleted || isCurrent
                                                ? 'text-foreground'
                                                : 'text-muted-foreground'
                                            }`}
                                    >
                                        {title}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                {isCurrent && (
                                    <span className="rounded-full bg-primary bg-opacity-10 px-2 py-0.5 text-xs font-medium text-primary">
                                        Current
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

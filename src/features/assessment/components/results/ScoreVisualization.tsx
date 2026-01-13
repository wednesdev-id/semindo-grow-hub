import { AssessmentScore, BusinessLevel } from '../../types'

interface ScoreVisualizationProps {
    score: AssessmentScore
}

export default function ScoreVisualization({ score }: ScoreVisualizationProps) {
    const getLevelColor = (level: BusinessLevel) => {
        switch (level) {
            case 'mikro':
                return 'text-danger'
            case 'kecil':
                return 'text-warning'
            case 'menengah':
                return 'text-success'
            default:
                return 'text-muted-foreground'
        }
    }

    const getLevelBgColor = (level: BusinessLevel) => {
        switch (level) {
            case 'mikro':
                return 'bg-danger bg-opacity-10'
            case 'kecil':
                return 'bg-warning bg-opacity-10'
            case 'menengah':
                return 'bg-success bg-opacity-10'
            default:
                return 'bg-muted'
        }
    }

    const getLevelLabel = (level: BusinessLevel) => {
        return level.charAt(0).toUpperCase() + level.slice(1)
    }

    // Calculate circle progress
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (score.totalScore / 100) * circumference

    return (
        <div className="rounded-lg bg-white p-6 shadow-soft dark:bg-card">
            <h3 className="mb-6 text-xl font-semibold text-foreground">
                Overall Score
            </h3>

            {/* Circular Progress */}
            <div className="relative mb-8">
                <div className="mx-auto h-56 w-56">
                    <svg className="rotate-[-90deg]" viewBox="0 0 200 200">
                        {/* Background Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="16"
                            className="text-muted"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="16"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className={`transition-all duration-1000 ${getLevelColor(score.umkmLevel)}`}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${getLevelColor(score.umkmLevel)}`}>
                            {Math.round(score.totalScore)}
                        </span>
                        <span className="text-sm text-muted-foreground">dari 100</span>
                    </div>
                </div>
            </div>

            {/* Level Badge */}
            <div className="mb-6 flex items-center justify-center">
                <div className={`rounded-full px-6 py-2 ${getLevelBgColor(score.umkmLevel)}`}>
                    <span className={`text-lg font-semibold ${getLevelColor(score.umkmLevel)}`}>
                        Level: {getLevelLabel(score.umkmLevel)}
                    </span>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Category Scores</h4>
                {Object.values(score.categoryScores).map((category) => (
                    <div key={category.name}>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                                {category.name}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                                {Math.round((category.score / category.maxScore) * 100)}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                            <div
                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

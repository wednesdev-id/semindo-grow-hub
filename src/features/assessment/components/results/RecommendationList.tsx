import { Recommendation } from '../../types'
import { Link } from 'react-router-dom'

interface RecommendationListProps {
    recommendations: Recommendation[]
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
    const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return 'bg-danger text-danger-foreground'
            case 'medium':
                return 'bg-warning text-warning-foreground'
            case 'low':
                return 'bg-success text-success-foreground'
        }
    }

    const getPriorityBorder = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return 'border-danger'
            case 'medium':
                return 'border-warning'
            case 'low':
                return 'border-success'
        }
    }

    const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
        switch (priority) {
            case 'high':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            case 'medium':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'low':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
                Recommendations
            </h3>

            {recommendations.map((recommendation) => (
                <div
                    key={recommendation.id}
                    className={`rounded-lg border-l-4 bg-white p-6 shadow-soft dark:bg-card ${getPriorityBorder(recommendation.priority)}`}
                >
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getPriorityColor(recommendation.priority)}`}>
                                {getPriorityIcon(recommendation.priority)}
                            </div>
                            <div>
                                <h4 className="mb-1 text-lg font-semibold text-foreground">
                                    {recommendation.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {recommendation.description}
                                </p>
                            </div>
                        </div>

                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium uppercase ${getPriorityColor(recommendation.priority)}`}>
                            {recommendation.priority}
                        </span>
                    </div>

                    {/* Action Items */}
                    {recommendation.action_items.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-2 text-sm font-semibold text-foreground">
                                Action Steps:
                            </h5>
                            <ul className="space-y-2">
                                {recommendation.action_items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resources */}
                    {recommendation.resources && recommendation.resources.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-2 text-sm font-semibold text-foreground">
                                Helpful Resources:
                            </h5>
                            <div className="space-y-2">
                                {recommendation.resources.map((resource, index) => (
                                    <a
                                        key={index}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        {resource.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                        {recommendation.estimated_time && (
                            <div className="flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{recommendation.estimated_time}</span>
                            </div>
                        )}
                        {recommendation.estimated_cost && (
                            <div className="flex items-center gap-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{recommendation.estimated_cost}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>{recommendation.category}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

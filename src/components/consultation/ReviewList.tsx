import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown } from 'lucide-react';
import { consultationService } from '@/services/consultationService';
import type { ConsultationReview } from '@/types/consultation';

interface ReviewListProps {
    consultantId: string;
}

export default function ReviewList({ consultantId }: ReviewListProps) {
    const [reviews, setReviews] = useState<ConsultationReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 5;

    useEffect(() => {
        loadReviews();
    }, [consultantId]);

    const loadReviews = async (loadMore = false) => {
        try {
            if (!loadMore) setLoading(true);
            const newOffset = loadMore ? offset : 0;
            const result = await consultationService.getReviews(consultantId, limit, newOffset) as unknown as { data: ConsultationReview[]; meta: { total: number } };

            // result is { data: ConsultationReview[], meta: { total } }
            const reviewsData = result.data || [];
            const totalCount = result.meta?.total || 0;

            if (loadMore) {
                setReviews(prev => [...prev, ...reviewsData]);
            } else {
                setReviews(reviewsData);
            }
            setTotal(totalCount);
            setOffset(newOffset + limit);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Reviews ({total})</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={review.client?.profilePictureUrl} />
                                        <AvatarFallback>
                                            {getInitials(review.client?.fullName || 'User')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {review.client?.fullName || 'Anonymous'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${review.rating >= star
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 mt-2">{review.comment}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {reviews.length < total && (
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => loadReviews(true)}
                                >
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Load More Reviews
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

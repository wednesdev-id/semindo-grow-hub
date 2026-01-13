import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { consultationService } from '@/services/consultationService';

interface ReviewFormProps {
    consultantId: string;
    consultantName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ReviewForm({ consultantId, consultantName, onSuccess, onCancel }: ReviewFormProps) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: 'Rating Required',
                description: 'Please select a rating before submitting',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSubmitting(true);
            await consultationService.createReview(consultantId, rating, comment || undefined);
            toast({
                title: 'Review Submitted',
                description: 'Thank you for your feedback!'
            });
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to submit review',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
                <CardDescription>
                    Share your experience with {consultantName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                        <Label className="mb-2 block">Rating</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${(hoverRating || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600 self-center">
                                {rating > 0 && (
                                    <>
                                        {rating === 1 && 'Poor'}
                                        {rating === 2 && 'Fair'}
                                        {rating === 3 && 'Good'}
                                        {rating === 4 && 'Very Good'}
                                        {rating === 5 && 'Excellent'}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details about your experience..."
                            rows={4}
                            className="mt-1"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={submitting || rating === 0}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

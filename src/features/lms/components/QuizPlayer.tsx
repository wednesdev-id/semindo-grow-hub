import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { lmsService } from '@/services/lmsService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

interface QuizPlayerProps {
    lessonId: string;
    onComplete?: (passed: boolean) => void;
}

export function QuizPlayer({ lessonId, onComplete }: QuizPlayerProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<any>(null);
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await lmsService.getQuiz(lessonId);
                setQuiz(data);
                if (data.timeLimit) {
                    setTimeLeft(data.timeLimit * 60);
                }
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
                // toast({ title: 'Error', description: 'Failed to load quiz', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [lessonId]);

    useEffect(() => {
        if (started && timeLeft !== null && timeLeft > 0 && !result) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev === 1) {
                        handleSubmit(); // Auto submit
                        return 0;
                    }
                    return prev ? prev - 1 : 0;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [started, timeLeft, result]);

    const handleStart = () => {
        setStarted(true);
    };

    const handleAnswer = (value: string) => {
        const question = quiz.questions[currentQuestionIndex];
        setAnswers({ ...answers, [question.id]: value });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const attempt = await lmsService.submitQuiz(quiz.id, answers);
            setResult(attempt);
            if (onComplete) {
                onComplete(attempt.isPassed);
            }
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            toast({ title: 'Error', description: 'Failed to submit quiz', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    if (!quiz) return <div className="text-center p-8 text-muted-foreground">No quiz available for this lesson.</div>;

    if (result) {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        {result.isPassed ? (
                            <CheckCircle2 className="h-24 w-24 text-green-500" />
                        ) : (
                            <XCircle className="h-24 w-24 text-red-500" />
                        )}
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">{result.score}%</div>
                        <p className="text-muted-foreground">
                            {result.isPassed ? 'Congratulations! You passed.' : 'Keep studying and try again.'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">Passing Score: {quiz.passingScore}%</p>
                    </div>
                </CardContent>
                <CardFooter className="justify-center gap-4">
                    {!result.isPassed && (
                        <Button onClick={() => {
                            setResult(null);
                            setStarted(false);
                            setAnswers({});
                            setCurrentQuestionIndex(0);
                            if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60);
                        }}>
                            Retry Quiz
                        </Button>
                    )}
                    {result.isPassed && (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Continue Lesson
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    }

    if (!started) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{quiz.description}</p>
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>{quiz.questions.length} Questions</span>
                        </div>
                        {quiz.timeLimit && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{quiz.timeLimit} Minutes</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Pass: {quiz.passingScore}%</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleStart} className="w-full">Start Quiz</Button>
                </CardFooter>
            </Card>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 font-mono ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                            <Clock className="h-4 w-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-medium">{currentQuestion.text}</h3>

                {currentQuestion.type === 'multiple_choice' && (
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={handleAnswer}
                        className="space-y-3"
                    >
                        {currentQuestion.options.map((option: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value={option.text} id={`opt-${idx}`} />
                                <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">{option.text}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {/* Add other types if needed */}
            </CardContent>
            <CardFooter className="justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={submitting}>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (submitting ? <LoadingSpinner /> : 'Submit Quiz') : 'Next Question'}
                </Button>
            </CardFooter>
        </Card>
    );
}

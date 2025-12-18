import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, CheckCircle2, Circle } from 'lucide-react';
import { lmsService } from '@/services/lmsService';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Question {
    id: string;
    text: string;
    type: 'multiple_choice' | 'boolean' | 'text';
    options: { text: string; isCorrect: boolean }[];
    points: number;
    order: number;
}

interface QuizBuilderProps {
    lessonId: string;
    onSave: () => void;
    initialData?: any;
}

export function QuizBuilder({ lessonId, onSave, initialData }: QuizBuilderProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30);
    const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            text: '',
            type: 'multiple_choice',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            points: 10,
            order: questions.length
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addOption = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newOptions = [...question.options, { text: '', isCorrect: false }];
            updateQuestion(questionId, { options: newOptions });
        }
    };

    const updateOption = (questionId: string, index: number, updates: Partial<{ text: string; isCorrect: boolean }>) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newOptions = [...question.options];
            newOptions[index] = { ...newOptions[index], ...updates };
            updateQuestion(questionId, { options: newOptions });
        }
    };

    const removeOption = (questionId: string, index: number) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newOptions = question.options.filter((_, i) => i !== index);
            updateQuestion(questionId, { options: newOptions });
        }
    };

    const handleSave = async () => {
        if (!title) {
            toast({ title: 'Error', description: 'Quiz title is required', variant: 'destructive' });
            return;
        }
        if (questions.length === 0) {
            toast({ title: 'Error', description: 'Add at least one question', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const quizData = {
                title,
                description,
                timeLimit: Number(timeLimit),
                passingScore: Number(passingScore),
                questions: questions.map((q, index) => ({
                    text: q.text,
                    type: q.type,
                    options: q.options,
                    points: Number(q.points),
                    order: index
                }))
            };

            await lmsService.createQuiz(lessonId, quizData);
            toast({ title: 'Success', description: 'Quiz saved successfully' });
            onSave();
        } catch (error) {
            console.error('Failed to save quiz:', error);
            toast({ title: 'Error', description: 'Failed to save quiz', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Quiz Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final Assessment" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Time Limit (minutes)</Label>
                            <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Passing Score (%)</Label>
                            <Input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {questions.map((question, index) => (
                    <Card key={question.id} className="relative">
                        <CardContent className="pt-6 space-y-4">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)} className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                <Label>Question {index + 1}</Label>
                                <Textarea
                                    value={question.text}
                                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                    placeholder="Enter question text..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={question.type}
                                        onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                            <SelectItem value="boolean">True / False</SelectItem>
                                            <SelectItem value="text">Short Answer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Points</Label>
                                    <Input
                                        type="number"
                                        value={question.points}
                                        onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {question.type === 'multiple_choice' && (
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateOption(question.id, optIndex, { isCorrect: !option.isCorrect })}
                                                className={`p-1 rounded-full ${option.isCorrect ? 'text-green-600' : 'text-gray-300'}`}
                                            >
                                                {option.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                            </button>
                                            <Input
                                                value={option.text}
                                                onChange={(e) => updateOption(question.id, optIndex, { text: e.target.value })}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOption(question.id, optIndex)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addOption(question.id)} className="mt-2">
                                        <Plus className="h-4 w-4 mr-2" /> Add Option
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? <LoadingSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Quiz
                </Button>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { lmsService } from "@/services/lmsService";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QuizEditorProps {
    lessonId: string;
}

interface Question {
    id?: string;
    text: string;
    type: "multiple_choice" | "text";
    options?: string[];
    correctAnswer?: string;
    points: number;
}

export function QuizEditor({ lessonId }: QuizEditorProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await lmsService.getQuiz(lessonId);
                if (data && data.questions) {
                    setQuestions(data.questions);
                }
            } catch (error) {
                // Ignore 404 if quiz doesn't exist yet
                console.log("No existing quiz found or error fetching");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [lessonId]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "",
                type: "multiple_choice",
                options: ["", "", "", ""],
                correctAnswer: "",
                points: 10,
            },
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options) {
            const newOptions = [...newQuestions[qIndex].options!];
            newOptions[oIndex] = value;
            newQuestions[qIndex].options = newOptions;
            setQuestions(newQuestions);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await lmsService.createQuiz(lessonId, { questions });
            toast({ title: "Success", description: "Quiz saved successfully" });
        } catch (error) {
            console.error("Failed to save quiz:", error);
            toast({ title: "Error", description: "Failed to save quiz", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {questions.map((q, index) => (
                <div key={index} className="border p-4 rounded-md space-y-4 bg-card">
                    <div className="flex justify-between items-start">
                        <h5 className="font-medium">Question {index + 1}</h5>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveQuestion(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                            value={q.text}
                            onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                            placeholder="Enter question here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={q.type}
                                onValueChange={(value) => handleQuestionChange(index, "type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="text">Text Answer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                                type="number"
                                value={q.points}
                                onChange={(e) => handleQuestionChange(index, "points", Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {q.type === "multiple_choice" && (
                        <div className="space-y-2">
                            <Label>Options</Label>
                            {q.options?.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={q.correctAnswer === option && option !== ""}
                                        onChange={() => handleQuestionChange(index, "correctAnswer", option)}
                                        className="h-4 w-4"
                                    />
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                    />
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground">Select the radio button to mark the correct answer.</p>
                        </div>
                    )}
                </div>
            ))}

            <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddQuestion} type="button">
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
                <Button onClick={handleSave} disabled={saving} type="button">
                    {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                    <Save className="mr-2 h-4 w-4" /> Save Quiz
                </Button>
            </div>
        </div>
    );
}

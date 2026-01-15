import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { assessmentService } from '../services/assessmentService';
import { AnswerValue } from '../types';
import { checkCondition } from '../utils/logic';

export const useAssessmentForm = (assessmentId: string) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, AnswerValue>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingSave, setPendingSave] = useState<{ questionId: string, value: AnswerValue } | null>(null);

    const debouncedSave = useDebounce(pendingSave, 1000);

    const { data: assessment, isLoading, error } = useQuery({
        queryKey: ['assessment', assessmentId],
        queryFn: () => assessmentService.getAssessment(assessmentId),
        enabled: !!assessmentId
    });

    // Initialize responses
    useEffect(() => {
        if (assessment?.responses) {
            const initialResponses: Record<string, AnswerValue> = {};
            assessment.responses.forEach((r: any) => {
                initialResponses[r.questionId] = r.answerValue;
            });
            setResponses(initialResponses);
        }
    }, [assessment]);

    // Auto-save mutation
    const saveResponseMutation = useMutation({
        mutationFn: ({ questionId, value }: { questionId: string, value: AnswerValue }) =>
            assessmentService.saveResponse(assessmentId, questionId, value),
        onError: () => {
            toast({
                title: "Gagal menyimpan",
                description: "Periksa koneksi internet Anda.",
                variant: "destructive"
            });
        }
    });

    // Debounced save and validation effect
    useEffect(() => {
        if (debouncedSave && assessment) {
            // Validate before saving (client-side)
            const question = assessment.template?.questions.find((q: any) => q.id === debouncedSave.questionId);
            if (question) {
                const error = validateQuestion(question, debouncedSave.value);
                if (error) {
                    setErrors(prev => ({ ...prev, [debouncedSave.questionId]: error }));
                    // Don't save if invalid? Or save anyway? Usually save only if valid or let backend reject.
                    // For now, let's save to backend to keep state in sync, backend will reject if invalid.
                    // Actually, if client validation fails, we might want to skip saving to avoid unnecessary requests.
                    // But if we want to save "draft" even if invalid, we should proceed.
                    // Given the requirements, let's proceed to save but keep the error.
                } else {
                    // Clear error if valid
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[debouncedSave.questionId];
                        return newErrors;
                    });
                }
            }

            saveResponseMutation.mutate(debouncedSave);
        }
    }, [debouncedSave, assessment]);

    // Submit mutation
    const submitAssessmentMutation = useMutation({
        mutationFn: () => assessmentService.submitAssessment(assessmentId),
        onSuccess: () => {
            navigate(`/assessment/results/${assessmentId}`);
        },
        onError: (error: any) => {
            toast({
                title: "Gagal mengirim",
                description: error.message || "Terjadi kesalahan saat mengirim assessment.",
                variant: "destructive"
            });
        }
    });

    const sections = assessment?.template?.questions
        ? Object.values(assessment.template.questions.reduce((acc: any, q: any) => {
            const category = q.category?.name || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = {
                    id: q.category.id,
                    title: category,
                    questions: []
                };
            }
            acc[category].questions.push(q);
            return acc;
        }, {})) as any[]
        : [];

    const currentSection = sections[currentSectionIndex];

    const handleAnswerChange = useCallback((questionId: string, value: AnswerValue) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));

        // Clear error immediately on change to improve UX (optimistic)
        // Validation will re-run on debounce
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }

        setPendingSave({ questionId, value });
    }, [errors]);

    const validateQuestion = (question: any, value: AnswerValue) => {
        if (!checkCondition(question, responses)) return null;

        let schema;
        switch (question.type) {
            case 'multiple_choice':
                schema = z.union([z.string(), z.array(z.string())]).refine(val => val.length > 0, "Pilihan wajib dipilih");
                break;
            case 'scale':
                schema = z.number().min(1).max(10);
                break;
            case 'boolean':
                schema = z.boolean();
                break;
            case 'text':
                schema = z.string().min(1, "Jawaban wajib diisi").max(500, "Maksimal 500 karakter");
                break;
            case 'location':
                schema = z.object({
                    address: z.string().min(5, "Alamat wajib diisi minimal 5 karakter"),
                    lat: z.number().refine(val => val !== 0, "Silakan pilih titik lokasi pada peta"),
                    lng: z.number().refine(val => val !== 0, "Silakan pilih titik lokasi pada peta")
                });
                break;
            default:
                schema = z.any();
        }

        const result = schema.safeParse(value);
        return result.success ? null : result.error.errors[0].message;
    };

    const validateSection = () => {
        const newErrors: Record<string, string> = {};

        if (currentSection) {
            currentSection.questions.forEach((question: any) => {
                const error = validateQuestion(question, responses[question.id]);
                if (error) {
                    newErrors[question.id] = error;
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateSection()) {
            toast({
                title: "Mohon lengkapi jawaban",
                description: "Masih ada pertanyaan yang belum dijawab di bagian ini.",
                variant: "destructive"
            });
            return;
        }

        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            submitAssessmentMutation.mutate();
        }
    };

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleResetSection = () => {
        if (confirm('Apakah Anda yakin ingin mereset jawaban di bagian ini?')) {
            const newResponses = { ...responses };
            currentSection.questions.forEach((q: any) => {
                delete newResponses[q.id];
            });
            setResponses(newResponses);
            setErrors({});
            toast({
                title: "Bagian direset",
                description: "Jawaban di bagian ini telah dikosongkan."
            });
        }
    };

    return {
        assessment,
        isLoading,
        error,
        sections,
        currentSection,
        currentSectionIndex,
        responses,
        errors,
        isSaving: saveResponseMutation.isPending,
        isSubmitting: submitAssessmentMutation.isPending,
        handleAnswerChange,
        handleNext,
        handleBack,
        handleResetSection,
        checkCondition: (question: any) => checkCondition(question, responses)
    };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '../services/assessmentService';

export const useAssessment = (assessmentId?: string) => {
    const queryClient = useQueryClient();

    // Fetch single assessment
    const {
        data: assessment,
        isLoading: isLoadingAssessment,
        error: assessmentError
    } = useQuery({
        queryKey: ['assessment', assessmentId],
        queryFn: () => assessmentService.getAssessment(assessmentId!),
        enabled: !!assessmentId
    });

    // Fetch assessment history (list)
    const {
        data: history,
        isLoading: isLoadingHistory,
        error: historyError
    } = useQuery({
        queryKey: ['assessment-history'],
        queryFn: () => assessmentService.getMyAssessments()
    });

    // Create new assessment
    const createAssessmentMutation = useMutation({
        mutationFn: (templateId: string) => assessmentService.createAssessment(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment-history'] });
        }
    });

    return {
        assessment,
        isLoadingAssessment,
        assessmentError,
        history,
        isLoadingHistory,
        historyError,
        createAssessment: createAssessmentMutation.mutateAsync,
        isCreating: createAssessmentMutation.isPending
    };
};

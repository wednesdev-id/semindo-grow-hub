import { api } from '../../../services/api';
import { AssessmentTemplate, Assessment } from '../types';

export const assessmentService = {
    getTemplates: async () => {
        const response = await api.get<{ data: AssessmentTemplate[] }>('/assessment/templates');
        return response.data;
    },

    createAssessment: async (templateId?: string) => {
        const response = await api.post<{ data: Assessment }>('/assessment', { templateId });
        return response.data;
    },

    getMyAssessments: async () => {
        const response = await api.get<{ data: Assessment[] }>('/assessment/me');
        return response.data;
    },

    getAssessment: async (id: string) => {
        const response = await api.get<{ data: Assessment }>(`/assessment/${id}`);
        return response.data;
    },

    saveResponse: async (assessmentId: string, questionId: string, value: any) => {
        const response = await api.post<{ data: any }>(`/assessment/${assessmentId}/responses`, {
            questionId,
            answerValue: value
        });
        return response.data;
    },

    submitAssessment: async (assessmentId: string) => {
        const response = await api.post<{ data: any }>(`/assessment/${assessmentId}/submit`, {});
        return response.data;
    }
};

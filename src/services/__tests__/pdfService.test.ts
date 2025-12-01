import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pdfService } from '../pdfService';
import { AssessmentScore, Recommendation } from '@/features/assessment/types';

// Mock jsPDF
const mockSave = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockAddPage = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFillColor = vi.fn();
const mockSplitTextToSize = vi.fn((text) => [text]); // Return array of strings
const mockSetPage = vi.fn();

vi.mock('jspdf', () => {
    return {
        default: class {
            internal = {
                pageSize: {
                    getWidth: () => 210,
                    getHeight: () => 297
                }
            };
            save = mockSave;
            text = mockText;
            rect = mockRect;
            addPage = mockAddPage;
            setFontSize = mockSetFontSize;
            setTextColor = mockSetTextColor;
            setFillColor = mockSetFillColor;
            splitTextToSize = mockSplitTextToSize;
            setPage = mockSetPage;
            getNumberOfPages = () => 1;
        }
    };
});

describe('pdfService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate assessment PDF', () => {
        const mockScore: AssessmentScore = {
            id: '123',
            totalScore: 85,
            umkmLevel: 'menengah',
            categoryScores: {
                'cat1': { name: 'Finance', score: 80, maxScore: 100 },
                'cat2': { name: 'Marketing', score: 90, maxScore: 100 }
            }
        };

        const mockRecommendations: Recommendation[] = [
            {
                id: 'rec1',
                assessment_id: '123',
                title: 'Improve Cash Flow',
                description: 'Do this and that',
                priority: 'high',
                category: 'Finance',
                action_items: [],
                resources: []
            }
        ];

        pdfService.generateAssessmentPDF(mockScore, mockRecommendations, 'My UMKM');

        // Verify jsPDF was instantiated (implicitly by method calls)
        // expect(vi.mocked(import('jspdf')).default).toHaveBeenCalled();

        // Verify key content was added
        expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Laporan Hasil Assessment'), expect.any(Number), expect.any(Number), expect.any(Object));
        expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Skor Anda: 85'), expect.any(Number), expect.any(Number));
        expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Level: MENENGAH'), expect.any(Number), expect.any(Number));

        // Verify recommendations were added
        expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Improve Cash Flow'), expect.any(Number), expect.any(Number));

        // Verify save was called with correct filename format
        expect(mockSave).toHaveBeenCalledWith(expect.stringMatching(/Assessment_Report_My UMKM_.*\.pdf/));
    });
});

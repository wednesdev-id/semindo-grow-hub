import jsPDF from 'jspdf';
import { AssessmentScore, Recommendation } from '@/features/assessment/types';

export const pdfService = {
    generateAssessmentPDF: (score: AssessmentScore, recommendations: Recommendation[], umkmName: string = 'UMKM') => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 51, 102); // Primary color
        doc.text('Laporan Hasil Assessment', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;

        // Score Section
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 40, 'F');

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(`Skor Anda: ${score.totalScore}`, margin + 10, yPos + 15);

        doc.setFontSize(14);
        doc.text(`Level: ${score.umkmLevel.toUpperCase()}`, margin + 10, yPos + 30);
        yPos += 50;

        // Category Scores
        doc.setFontSize(16);
        doc.setTextColor(0, 51, 102);
        doc.text('Rincian Skor per Kategori', margin, yPos);
        yPos += 10;

        Object.values(score.categoryScores).forEach((cat) => {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`${cat.name}: ${Math.round((cat.score / cat.maxScore) * 100)}`, margin, yPos);
            yPos += 8;
        });
        yPos += 10;

        // Recommendations
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text('Rekomendasi', margin, yPos);
        yPos += 15;

        recommendations.forEach((rec, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`${index + 1}. ${rec.title}`, margin, yPos);
            yPos += 8;

            doc.setFontSize(11);
            doc.setTextColor(80);
            const splitDesc = doc.splitTextToSize(rec.description, pageWidth - (margin * 2));
            doc.text(splitDesc, margin, yPos);
            yPos += (splitDesc.length * 6) + 10;
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
            doc.text('Sinergi UMKM Indonesia', margin, doc.internal.pageSize.getHeight() - 10);
        }

        doc.save(`Assessment_Report_${umkmName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }
};

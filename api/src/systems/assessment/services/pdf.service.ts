import PDFDocument from 'pdfkit';
import { AssessmentScore, AssessmentRecommendation, Assessment, User, UMKMProfile } from '@prisma/client';

interface PDFData {
    assessment: Assessment & {
        user: User & { umkmProfile: UMKMProfile | null };
        score: AssessmentScore | null;
        recommendations: AssessmentRecommendation[];
    };
}

export class PdfService {
    async generateAssessmentReport(data: PDFData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.on('error', (err) => {
                reject(err);
            });

            // Header
            this.generateHeader(doc);

            // User Info
            this.generateUserInfo(doc, data);

            // Score Section
            this.generateScoreSection(doc, data);

            // Recommendations
            this.generateRecommendations(doc, data.assessment.recommendations);

            // Footer
            this.generateFooter(doc);

            doc.end();
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(20)
            .text('Laporan Hasil Asesmen UMKM', { align: 'center' })
            .moveDown();

        doc
            .fontSize(12)
            .text('Semindo - Sinergi UMKM Indonesia', { align: 'center' })
            .moveDown(2);

        // Draw a line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
    }

    private generateUserInfo(doc: PDFKit.PDFDocument, data: PDFData) {
        const { user } = data.assessment;
        const umkm = user.umkmProfile;

        doc.fontSize(14).font('Helvetica-Bold').text('Informasi Bisnis', { underline: true }).moveDown(0.5);
        doc.font('Helvetica');

        doc.fontSize(10);
        doc.text(`Nama Pemilik: ${user.fullName}`);
        doc.text(`Nama Bisnis: ${umkm?.businessName || '-'}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Tanggal Asesmen: ${new Date(data.assessment.createdAt).toLocaleDateString('id-ID')}`);
        doc.moveDown(2);
    }

    private generateScoreSection(doc: PDFKit.PDFDocument, data: PDFData) {
        const score = data.assessment.score;
        if (!score) return;

        doc.fontSize(14).font('Helvetica-Bold').text('Hasil Penilaian', { underline: true }).moveDown(0.5);
        doc.font('Helvetica');

        // Overall Score
        doc.fontSize(12).text(`Skor Keseluruhan: ${score.totalScore}`);
        doc.text(`Level UMKM: ${score.umkmLevel.toUpperCase()}`);
        doc.moveDown();

        // Category Scores
        if (score.categoryScores) {
            doc.text('Rincian per Kategori:', { underline: true }).moveDown(0.5);
            const categories = score.categoryScores as Record<string, number>;

            Object.entries(categories).forEach(([category, value]) => {
                doc.text(`${category}: ${value}`);
            });
        }
        doc.moveDown(2);
    }

    private generateRecommendations(doc: PDFKit.PDFDocument, recommendations: AssessmentRecommendation[]) {
        doc.fontSize(14).font('Helvetica-Bold').text('Rekomendasi Pengembangan', { underline: true }).moveDown(0.5);
        doc.font('Helvetica');

        if (recommendations.length === 0) {
            doc.fontSize(10).text('Belum ada rekomendasi khusus untuk saat ini.');
            return;
        }

        recommendations.forEach((rec, index) => {
            doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${rec.title}`);
            doc.font('Helvetica');
            doc.fontSize(10).text(rec.description);

            if (rec.actionItems) {
                doc.moveDown(0.2);
                doc.font('Helvetica-Oblique').text('Langkah Aksi:');
                doc.font('Helvetica');
                const actions = rec.actionItems as string[];
                actions.forEach(action => {
                    doc.text(`• ${action}`, { indent: 10 });
                });
            }
            doc.moveDown();
        });
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        const bottom = doc.page.height - 50;
        doc.fontSize(8).text(
            'Dokumen ini dihasilkan secara otomatis oleh sistem Semindo.',
            50,
            bottom,
            { align: 'center', width: 500 }
        );
    }
}

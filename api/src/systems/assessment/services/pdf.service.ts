import PDFDocument from 'pdfkit';
import { AssessmentScore, AssessmentRecommendation, Assessment, User, UMKMProfile } from '../../../../prisma/generated/client';
import QuickChart from 'quickchart-js';
import NodeCache from 'node-cache';

// Cache for 1 hour
const pdfCache = new NodeCache({ stdTTL: 3600 });

interface PDFData {
    assessment: Assessment & {
        user: User & { umkmProfiles: UMKMProfile | null };
        score: AssessmentScore | null;
        recommendations: AssessmentRecommendation[];
    };
}

export class PdfService {
    async generateAssessmentReport(data: PDFData): Promise<Buffer> {
        const cacheKey = `pdf_assessment_${data.assessment.id}`;
        const cachedPdf = pdfCache.get<Buffer>(cacheKey);

        if (cachedPdf) {
            console.log(`Serving PDF from cache: ${cacheKey}`);
            return cachedPdf;
        }

        const pdfBuffer = await this.createPdfDocument(data);
        pdfCache.set(cacheKey, pdfBuffer);
        return pdfBuffer;
    }

    private async createPdfDocument(data: PDFData): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
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

            // Score Section with Chart
            await this.generateScoreSection(doc, data);

            // Recommendations
            this.generateRecommendations(doc, data.assessment.recommendations);

            // Footer
            this.generateFooter(doc, data);

            doc.end();
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('Laporan Hasil Asesmen UMKM', { align: 'center' })
            .moveDown(0.5);

        doc
            .fontSize(12)
            .font('Helvetica')
            .text('Semindo - Sinergi UMKM Indonesia', { align: 'center' })
            .text('Platform Digital Pengembangan UMKM Terpadu', { align: 'center' })
            .moveDown(1.5);

        // Draw a line
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();
        doc.moveDown(2);
    }

    private generateUserInfo(doc: PDFKit.PDFDocument, data: PDFData) {
        const { user } = data.assessment;
        const umkm = user.umkmProfiles;

        doc.fontSize(14).font('Helvetica-Bold').text('Informasi Bisnis', { underline: true }).moveDown(0.5);
        doc.font('Helvetica');

        const startX = 50;
        let currentY = doc.y;

        const labelWidth = 120;

        const addField = (label: string, value: string) => {
            doc.text(label, startX, currentY, { width: labelWidth });
            doc.text(`: ${value}`, startX + labelWidth, currentY);
            currentY += 15;
        };

        addField('Nama Pemilik', user.fullName);
        addField('Nama Bisnis', umkm?.businessName || '-');
        addField('Email', user.email);
        addField('Tanggal Asesmen', new Date(data.assessment.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
        addField('ID Asesmen', data.assessment.id.split('-')[0].toUpperCase());

        doc.y = currentY + 20;
    }

    private async generateScoreSection(doc: PDFKit.PDFDocument, data: PDFData) {
        const score = data.assessment.score;
        if (!score) return;

        doc.fontSize(14).font('Helvetica-Bold').text('Hasil Penilaian', { underline: true }).moveDown(0.5);
        doc.font('Helvetica');

        // Overall Score Box
        const scoreBoxY = doc.y;
        doc.rect(50, scoreBoxY, 500, 60).fillAndStroke('#f0f9ff', '#0284c7');

        doc.fillColor('#000000');
        doc.fontSize(12).text('Skor Keseluruhan', 70, scoreBoxY + 15);
        doc.fontSize(24).font('Helvetica-Bold').text(`${score.totalScore}`, 70, scoreBoxY + 30);

        doc.fontSize(12).font('Helvetica').text('Level UMKM', 300, scoreBoxY + 15);
        doc.fontSize(20).font('Helvetica-Bold').text(`${score.umkmLevel.toUpperCase()}`, 300, scoreBoxY + 30);

        doc.moveDown(4);

        // Chart
        if (score.categoryScores) {
            const categories = score.categoryScores as Record<string, number>;
            const chartBuffer = await this.generateRadarChart(categories);

            // Center the chart
            doc.image(chartBuffer, (doc.page.width - 400) / 2, doc.y, { width: 400 });
            doc.moveDown(18); // Adjust spacing based on chart height
        }
    }

    private async generateRadarChart(scores: Record<string, number>): Promise<Buffer> {
        const chart = new QuickChart();
        chart.setWidth(500);
        chart.setHeight(300);
        chart.setConfig({
            type: 'radar',
            data: {
                labels: Object.keys(scores),
                datasets: [{
                    label: 'Skor Kategori',
                    data: Object.values(scores),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                }]
            },
            options: {
                scale: {
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20
                    }
                },
                legend: {
                    display: false
                }
            }
        });

        return await chart.toBinary();
    }

    private generateRecommendations(doc: PDFKit.PDFDocument, recommendations: AssessmentRecommendation[]) {
        doc.addPage(); // Start recommendations on a new page

        doc.fontSize(16).font('Helvetica-Bold').text('Rekomendasi Pengembangan', { underline: true }).moveDown(1);
        doc.font('Helvetica');

        if (recommendations.length === 0) {
            doc.fontSize(12).text('Belum ada rekomendasi khusus untuk saat ini.');
            return;
        }

        recommendations.forEach((rec, index) => {
            // Priority Badge Color
            let badgeColor = '#6b7280'; // gray
            if (rec.priority === 'high') badgeColor = '#ef4444'; // red
            if (rec.priority === 'medium') badgeColor = '#f59e0b'; // amber

            // Draw Priority Badge
            const currentY = doc.y;
            doc.circle(60, currentY + 6, 4).fill(badgeColor);

            doc.fillColor('#000000');
            doc.fontSize(12).font('Helvetica-Bold').text(rec.title, 75, currentY);
            doc.moveDown(0.3);

            doc.fontSize(10).font('Helvetica').text(rec.description, 75, doc.y, { width: 450 });
            doc.moveDown(0.5);

            if (rec.actionItems) {
                doc.font('Helvetica-Oblique').text('Langkah Aksi:', 75);
                doc.font('Helvetica');
                const actions = rec.actionItems as string[];
                actions.forEach(action => {
                    doc.text(`• ${action}`, 85, doc.y, { width: 440 });
                });
            }
            doc.moveDown(1.5);
        });
    }

    private generateFooter(doc: PDFKit.PDFDocument, data: PDFData) {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            const bottom = doc.page.height - 50;

            doc.fontSize(8).fillColor('#6b7280');

            // Left side: System info
            doc.text(
                `Generated by Semindo System v1.0 | ${new Date().toISOString()}`,
                50,
                bottom
            );

            // Right side: Page number
            doc.text(
                `Halaman ${i + 1} dari ${pages.count}`,
                500,
                bottom,
                { align: 'right' }
            );
        }
    }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface MoMResult {
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ task: string; priority: string }>;
  recommendations: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async processAudioForMoM(audioPath: string): Promise<MoMResult> {
    // Read audio file
    const audioData = fs.readFileSync(audioPath);
    const audioBase64 = audioData.toString('base64');

    // Determine MIME type
    const mimeType = this.getMimeType(audioPath);

    // Prompt untuk konsultasi UMKM
    const prompt = `
Kamu adalah asisten AI yang membantu membuat notulensi konsultasi UMKM.

Dari rekaman audio konsultasi ini, buatlah:

1. TRANSKRIP LENGKAP
   - Tulis percakapan lengkap dengan format:
     Konsultan: [ucapan]
     Klien: [ucapan]

2. RINGKASAN KONSULTASI
   - Ringkas poin-poin utama yang dibahas (3-5 paragraf)
   - Fokus pada solusi dan saran yang diberikan

3. POIN KUNCI
   - Buat daftar 5-10 poin penting yang dibahas
   - Format: bullet points

4. ACTION ITEMS
   - Daftar tugas/langkah yang harus dilakukan klien
   - Format JSON: [{ "task": "...", "priority": "high/medium/low" }]

5. REKOMENDASI
   - Saran follow-up untuk klien
   - Rekomendasi program/pelatihan yang relevan

Format output dalam JSON:
{
  "transcript": "...",
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": [{"task": "...", "priority": "..."}],
  "recommendations": "..."
}
`;

    const result = await this.model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64
            }
          },
          { text: prompt }
        ]
      }]
    });

    const response = result.response.text();

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'mp3': 'audio/mp3',
      'm4a': 'audio/mp4',
      'wav': 'audio/wav',
      'webm': 'audio/webm',
      'ogg': 'audio/ogg'
    };
    return mimeTypes[ext || ''] || 'audio/mpeg';
  }
}

export const geminiService = new GeminiService();

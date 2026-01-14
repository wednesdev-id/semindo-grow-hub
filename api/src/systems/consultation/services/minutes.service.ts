import { PrismaClient } from '@prisma/client';
import { geminiService } from '../../ai/gemini.service';
import { videoConversionService } from '../../ai/video-conversion.service';
import path from 'path';

const prisma = new PrismaClient();

export interface CreateMinutesData {
  requestId: string;
  createdBy: string;
}

export interface UpdateMinutesData {
  summary?: string;
  keyPoints?: string[];
  actionItems?: Array<{ task: string; priority: string }>;
  recommendations?: string;
}

/**
 * Create MoM for a consultation
 */
export const createMinutes = async (data: CreateMinutesData) => {
  // Check if request is completed
  const request = await prisma.consultationRequest.findUnique({
    where: { id: data.requestId }
  });

  if (!request) {
    throw new Error('Consultation request not found');
  }

  if (request.status !== 'completed') {
    throw new Error('Can only create MoM for completed consultations');
  }

  // Check if MoM already exists
  const existing = await prisma.consultationMinutes.findUnique({
    where: { requestId: data.requestId }
  });

  if (existing) {
    throw new Error('MoM already exists for this consultation');
  }

  // Create draft MoM
  return await prisma.consultationMinutes.create({
    data: {
      requestId: data.requestId,
      createdBy: data.createdBy,
      status: 'draft'
    }
  });
};

/**
 * Upload audio/video file for MoM
 */
export const uploadAudioForMoM = async (
  minutesId: string,
  audioFile: Express.Multer.File
): Promise<void> => {
  let filePath = audioFile.path;
  let fileName = audioFile.originalname;
  let fileSize = audioFile.size;
  let isVideo = videoConversionService.isVideoFile(audioFile.path);

  // Update with file info
  await prisma.consultationMinutes.update({
    where: { id: minutesId },
    data: {
      audioFileUrl: `/uploads/mom/${audioFile.filename}`,
      audioFileName: audioFile.originalname,
      audioFileSize: audioFile.size,
      status: 'processing'
    }
  });

  // Process in background (fire and forget for now, can be improved with queue later)
  processAudioInBackground(minutesId, audioFile.path);
};

/**
 * Process audio in background (synchronous for now, can be converted to queue-based)
 */
const processAudioInBackground = async (minutesId: string, audioPath: string) => {
  try {
    let finalAudioPath = audioPath;
    let isVideo = videoConversionService.isVideoFile(audioPath);

    // Step 1: Convert video to audio if needed
    if (isVideo) {
      console.log('Video file detected, converting to audio...');
      try {
        finalAudioPath = await videoConversionService.convertVideoToAudio(audioPath);
      } catch (error) {
        console.error('Video conversion failed:', error);
        throw new Error('Failed to convert video to audio');
      }
    }

    // Step 2: Process with Gemini AI
    console.log('Processing audio with Gemini AI...');
    const result = await geminiService.processAudioForMoM(finalAudioPath);

    // Step 3: Update database with results
    await prisma.consultationMinutes.update({
      where: { id: minutesId },
      data: {
        transcript: result.transcript,
        summary: result.summary,
        keyPoints: result.keyPoints,
        actionItems: result.actionItems,
        recommendations: result.recommendations,
        status: 'ready'
      }
    });

    console.log('MoM processing completed successfully');
  } catch (error) {
    console.error('Error processing MoM:', error);
    await prisma.consultationMinutes.update({
      where: { id: minutesId },
      data: {
        status: 'draft',
        processingError: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Update MoM
 */
export const updateMinutes = async (minutesId: string, data: UpdateMinutesData) => {
  return await prisma.consultationMinutes.update({
    where: { id: minutesId },
    data
  });
};

/**
 * Publish MoM
 */
export const publishMinutes = async (minutesId: string) => {
  return await prisma.consultationMinutes.update({
    where: { id: minutesId },
    data: {
      status: 'published',
      publishedAt: new Date()
    }
  });
};

/**
 * Get MoM by request ID
 */
export const getMinutes = async (requestId: string) => {
  return await prisma.consultationMinutes.findUnique({
    where: { requestId },
    include: {
      request: {
        include: {
          client: { select: { fullName: true, email: true } },
          consultant: {
            include: {
              user: { select: { fullName: true } }
            }
          }
        }
      }
    }
  });
};

/**
 * Get MoM by ID
 */
export const getMinutesById = async (minutesId: string) => {
  return await prisma.consultationMinutes.findUnique({
    where: { id: minutesId },
    include: {
      request: {
        include: {
          client: { select: { fullName: true, email: true } },
          consultant: {
            include: {
              user: { select: { fullName: true } }
            }
          }
        }
      }
    }
  });
};

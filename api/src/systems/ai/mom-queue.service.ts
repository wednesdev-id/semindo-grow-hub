// @ts-nocheck - This file is for production use with Redis queue system
// Currently using synchronous processing in minutes.service.ts for development
// To enable: Install Redis, update .env with Redis connection, then run: npm run worker

import { Queue, Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { geminiService } from './gemini.service';
import { videoConversionService } from './video-conversion.service';

const prisma = new PrismaClient();

// Connection to Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Create queue for MoM processing
export const momQueue = new Queue('mom-processing', { connection });

interface MoMJobData {
  minutesId: string;
  audioPath: string;
  isVideo: boolean;
  userId: string;
}

/**
 * Process MoM job - Runs in background worker
 */
const processMoMJob = async (job: Job<MoMJobData>) => {
  const { minutesId, audioPath, isVideo, userId } = job.data;

  try {
    console.log(`Processing MoM job ${job.id} for minutes ${minutesId}`);

    // Step 1: Convert video to audio if needed
    let finalAudioPath = audioPath;
    let fileName = audioPath.split('/').pop() || '';

    if (isVideo) {
      console.log('Converting video to audio...');
      finalAudioPath = await videoConversionService.convertVideoToAudio(audioPath);
      fileName = fileName.replace(/\.[^/.]+$/, '.mp3');

      // Get file size
      const fs = require('fs');
      const stats = fs.statSync(finalAudioPath);

      // Update database with converted audio info
      await prisma.consultationMinutes.update({
        where: { id: minutesId },
        data: {
          audioFileUrl: `/uploads/mom/${finalAudioPath.split('/').pop()}`,
          audioFileName: fileName,
          audioFileSize: stats.size,
        }
      });
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

    console.log(`MoM job ${job.id} completed successfully`);

    // TODO: Send notification to user
    // await sendNotification(userId, {
    //   title: 'Notulensi Siap!',
    //   body: 'Notulensi konsultasi Anda telah selesai diproses.',
    //   actionUrl: `/consultation/sessions/${minutesId}`
    // });

    return { success: true };
  } catch (error) {
    console.error(`MoM job ${job.id} failed:`, error);

    // Update database with error
    await prisma.consultationMinutes.update({
      where: { id: minutesId },
      data: {
        status: 'draft',
        processingError: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    throw error;
  }
};

/**
 * Create worker (run in separate process)
 */
export const createMomWorker = () => {
  const worker = new Worker<MoMJobData>(
    'mom-processing',
    async (job) => {
      return await processMoMJob(job);
    },
    {
      connection,
      concurrency: 2, // Process 2 jobs at a time (adjust based on CPU)
      limiter: {
        max: 2, // Max 2 concurrent video conversions
        duration: 1000, // Per second
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
};

/**
 * Add MoM processing job to queue
 */
export const addMoMJob = async (data: MoMJobData) => {
  const job = await momQueue.add('process-mom', data, {
    attempts: 3, // Retry 3 times if failed
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay
    },
    removeOnComplete: {
      age: 3600, // Remove completed jobs after 1 hour
      count: 100, // Keep last 100 jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Remove failed jobs after 24 hours
      count: 50, // Keep last 50 failed jobs
    },
  });

  console.log(`MoM job ${job.id} added to queue`);
  return job;
};

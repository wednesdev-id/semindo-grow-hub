import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export class VideoConversionService {
  /**
   * Convert video file to audio
   * @param videoPath - Path to video file
   * @returns Path to converted audio file
   */
  async convertVideoToAudio(videoPath: string): Promise<string> {
    const outputPath = videoPath.replace(path.extname(videoPath), '.mp3');

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .toFormat('mp3')
        .on('end', () => {
          // Delete original video file to save space
          try {
            fs.unlinkSync(videoPath);
          } catch (error) {
            console.error('Failed to delete original video:', error);
          }
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error converting video to audio:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  /**
   * Check if file is video
   */
  isVideoFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
  }
}

export const videoConversionService = new VideoConversionService();

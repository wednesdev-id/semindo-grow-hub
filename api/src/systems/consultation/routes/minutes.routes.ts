import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middlewares/auth.middleware';
import * as minutesService from '../services/minutes.service';

const router = Router();

// Configure multer for audio/video uploads
const storage = multer.diskStorage({
  destination: 'uploads/mom/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fileType = file.mimetype.startsWith('video') ? 'video' : 'audio';
    cb(null, `${fileType}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (support video)
  fileFilter: (req, file, cb) => {
    // Accept both audio and video files
    const allowedAudio = /mp3|m4a|wav|webm|ogg/;
    const allowedVideo = /mp4|mov|avi|mkv/;
    const extname = allowedAudio.test(path.extname(file.originalname).toLowerCase()) ||
                    allowedVideo.test(path.extname(file.originalname).toLowerCase());
    const isAudio = file.mimetype.startsWith('audio');
    const isVideo = file.mimetype.startsWith('video');

    if ((isAudio || isVideo) && extname) {
      return cb(null, true);
    }
    cb(new Error('Only audio and video files are allowed'));
  }
});

// Create MoM for a consultation
router.post('/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;

    const minutes = await minutesService.createMinutes({
      requestId,
      createdBy: userId
    });

    res.json({ success: true, data: minutes });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create MoM'
    });
  }
});

// Upload audio file
router.post('/:minutesId/upload', authenticate, upload.single('audio'), async (req, res) => {
  try {
    const { minutesId } = req.params;
    const userId = req.user!.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    await minutesService.uploadAudioForMoM(minutesId, req.file, userId);

    res.json({
      success: true,
      message: 'File uploaded, processing in progress',
      data: {
        status: req.file.mimetype.startsWith('video') ? 'queued' : 'processing',
        estimatedTime: req.file.mimetype.startsWith('video') ? '5-10 minutes' : '2-5 minutes'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    });
  }
});

// Get MoM by request ID
router.get('/request/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const minutes = await minutesService.getMinutes(requestId);

    res.json({ success: true, data: minutes });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get MoM'
    });
  }
});

// Get MoM by ID
router.get('/:minutesId', authenticate, async (req, res) => {
  try {
    const { minutesId } = req.params;
    const minutes = await minutesService.getMinutesById(minutesId);

    if (!minutes) {
      return res.status(404).json({ success: false, error: 'MoM not found' });
    }

    res.json({ success: true, data: minutes });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get MoM'
    });
  }
});

// Update MoM (edit by consultant)
router.patch('/:minutesId', authenticate, async (req, res) => {
  try {
    const { minutesId } = req.params;
    const { summary, keyPoints, actionItems, recommendations } = req.body;

    const minutes = await minutesService.updateMinutes(minutesId, {
      summary,
      keyPoints,
      actionItems,
      recommendations
    });

    res.json({ success: true, data: minutes });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update MoM'
    });
  }
});

// Publish MoM
router.post('/:minutesId/publish', authenticate, async (req, res) => {
  try {
    const { minutesId } = req.params;
    const minutes = await minutesService.publishMinutes(minutesId);

    res.json({ success: true, data: minutes });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish MoM'
    });
  }
});

export default router;

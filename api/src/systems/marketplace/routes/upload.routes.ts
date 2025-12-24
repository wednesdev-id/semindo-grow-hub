import { Router } from 'express';
import { upload, uploadController } from '../controllers/upload.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/upload/image', authenticate, upload.single('image'), uploadController.uploadImage);
router.post('/upload/images', authenticate, upload.array('images', 10), uploadController.uploadMultipleImages);
router.post('/upload/url', authenticate, uploadController.uploadFromUrl);

export const uploadRouter = router;

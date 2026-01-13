import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';

const router = Router()
const controller = new AssessmentController()

// All routes require authentication
router.use(authenticate)

router.post('/', (req, res, next) => {
    console.log('Assessment POST / hit')
    next()
}, controller.create)
router.get('/templates', cacheMiddleware(300), controller.getTemplates)
router.get('/templates/:category', cacheMiddleware(300), controller.getTemplates)
router.get('/me', controller.getMyAssessments)
router.get('/:id', controller.getOne)
router.post('/:id/responses', controller.saveResponse)
router.post('/:id/submit', controller.submit)
router.get('/:id/pdf', controller.downloadPdf)
router.get('/:id/preview', controller.previewPdf)

export const assessmentRouter = router

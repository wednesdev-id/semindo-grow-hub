import { Router } from 'express'
import { AssessmentController } from './assessment.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()
const controller = new AssessmentController()

// All routes require authentication
router.use(authenticate)

router.post('/', (req, res, next) => {
    console.log('Assessment POST / hit')
    next()
}, controller.create)
router.get('/me', controller.getMyAssessments)
router.get('/:id', controller.getOne)
router.post('/:id/responses', controller.saveResponse)
router.post('/:id/submit', controller.submit)

export const assessmentRouter = router

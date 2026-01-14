import { Router } from 'express';
import { onboardingController } from '../controllers/onboarding.controller';

const router = Router();

// Public routes (no auth required)
router.post('/register', (req, res) => onboardingController.register(req, res));
router.get('/services', (req, res) => onboardingController.getServices(req, res));
router.get('/sectors', (req, res) => onboardingController.getSectors(req, res));
router.get('/omzet-ranges', (req, res) => onboardingController.getOmzetRanges(req, res));

export const onboardingRouter = router;

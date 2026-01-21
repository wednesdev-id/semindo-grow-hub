"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingRouter = void 0;
const express_1 = require("express");
const onboarding_controller_1 = require("../controllers/onboarding.controller");
const router = (0, express_1.Router)();
// Public routes (no auth required)
router.post('/register', (req, res) => onboarding_controller_1.onboardingController.register(req, res));
router.get('/services', (req, res) => onboarding_controller_1.onboardingController.getServices(req, res));
router.get('/sectors', (req, res) => onboarding_controller_1.onboardingController.getSectors(req, res));
router.get('/omzet-ranges', (req, res) => onboarding_controller_1.onboardingController.getOmzetRanges(req, res));
exports.onboardingRouter = router;

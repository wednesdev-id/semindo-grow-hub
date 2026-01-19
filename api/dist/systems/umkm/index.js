"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.umkmRouter = void 0;
const express_1 = require("express");
const umkm_controller_1 = require("./controllers/umkm.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.umkmRouter = (0, express_1.Router)();
// Public/Shared Routes
exports.umkmRouter.get('/stats', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getStats);
exports.umkmRouter.get('/', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getProfiles);
exports.umkmRouter.get('/:id', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getProfile);
// UMKM Owner Routes
exports.umkmRouter.post('/', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.createProfile);
exports.umkmRouter.patch('/:id', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.updateProfile);
const upload_middleware_1 = require("../../middleware/upload.middleware");
// Documents
exports.umkmRouter.post('/:id/documents', auth_middleware_1.authenticate, upload_middleware_1.upload.single('file'), umkm_controller_1.UMKMController.uploadDocument);
exports.umkmRouter.patch('/documents/:docId/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'internal_ops']), umkm_controller_1.UMKMController.verifyDocument);
// Mentoring
exports.umkmRouter.get('/:id/mentoring', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getMentoringSessions);
exports.umkmRouter.post('/mentoring', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor', 'internal_ops']), umkm_controller_1.UMKMController.addMentoringSession);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsRouter = void 0;
const express_1 = require("express");
const permissions_controller_1 = require("../controllers/permissions.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new permissions_controller_1.PermissionsController();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// All permission management routes require admin role
router.use((0, auth_middleware_1.requireRole)(['admin', 'super_admin']));
// GET /api/v1/permissions - List all permissions
router.get('/', controller.findAll);
// GET /api/v1/permissions/:id - Get permission details
router.get('/:id', controller.findById);
// POST /api/v1/permissions - Create permission
router.post('/', controller.create);
// PATCH /api/v1/permissions/:id - Update permission
router.patch('/:id', controller.update);
// DELETE /api/v1/permissions/:id - Delete permission
router.delete('/:id', controller.delete);
exports.permissionsRouter = router;

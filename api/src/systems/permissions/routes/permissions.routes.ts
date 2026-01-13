import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new PermissionsController();

// Apply authentication to all routes
router.use(authenticate);

// All permission management routes require admin role
router.use(requireRole(['admin', 'super_admin']));

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

export const permissionsRouter = router;

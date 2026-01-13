import { Router } from 'express';
import { RolesController } from '../controllers/roles.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new RolesController();

// Apply authentication to all routes
router.use(authenticate);

// All role management routes require admin role
router.use(requireRole(['admin', 'super_admin']));

// GET /api/v1/roles - List all roles
router.get('/', controller.findAll);

// GET /api/v1/roles/:id - Get role details
router.get('/:id', controller.findById);

// POST /api/v1/roles - Create role
router.post('/', controller.create);

// PATCH /api/v1/roles/:id - Update role
router.patch('/:id', controller.update);

// DELETE /api/v1/roles/:id - Delete role
router.delete('/:id', controller.delete);

// GET /api/v1/roles/:id/users - Get users with role
router.get('/:id/users', controller.getUsersByRole);

// GET /api/v1/roles/:id/permissions - Get role permissions
router.get('/:id/permissions', controller.getRolePermissions);

// POST /api/v1/roles/:id/permissions - Assign permissions to role
router.post('/:id/permissions', controller.assignPermissions);

// DELETE /api/v1/roles/:id/permissions/:permissionId - Remove permission from role
router.delete('/:id/permissions/:permissionId', controller.removePermission);

export const rolesRouter = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const user_map_controller_1 = require("../controllers/user-map.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const upload_service_1 = require("../../utils/upload.service");
const router = (0, express_1.Router)();
const controller = new users_controller_1.UsersController();
const mapController = new user_map_controller_1.UserMapController();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// Profile Management Routes (must come before /:id routes)
// GET /api/v1/users/me - Get current user profile
router.get('/me', controller.getCurrentUser);
// PATCH /api/v1/users/me - Update own profile
router.patch('/me', controller.updateOwnProfile);
// POST /api/v1/users/me/change-password - Change password
router.post('/me/change-password', controller.changePassword);
// POST /api/v1/users/me/upload-picture - Upload profile picture
router.post('/me/upload-picture', upload_service_1.upload.single('picture'), controller.uploadProfilePicture);
// Map Distribution Route (Must be before /:id)
// GET /api/v1/users/distribution - Get user distribution map data
router.get('/distribution', (0, auth_middleware_1.requireRole)(['admin', 'super_admin', 'management']), mapController.getDistribution);
// Admin Routes
// GET /api/v1/users - List users (Admin/SuperAdmin)
router.get('/', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.findAll);
// GET /api/v1/users/:id - Get user details
router.get('/:id', controller.findById);
// POST /api/v1/users - Create user (Admin/SuperAdmin)
router.post('/', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.create);
// PATCH /api/v1/users/:id - Update user
router.patch('/:id', controller.update);
// DELETE /api/v1/users/:id - Delete user (SuperAdmin only)
router.delete('/:id', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.delete);
// User-Role Management Routes (Admin only)
// POST /api/v1/users/:id/roles - Assign roles to user
router.post('/:id/roles', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.assignRoles);
// DELETE /api/v1/users/:id/roles/:roleId - Remove role from user
router.delete('/:id/roles/:roleId', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.removeRole);
// Bulk Operations Routes (Admin only)
// POST /api/v1/users/bulk-delete - Bulk delete users
router.post('/bulk-delete', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.bulkDelete);
// POST /api/v1/users/bulk-activate - Bulk activate users
router.post('/bulk-activate', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.bulkActivate);
// POST /api/v1/users/bulk-deactivate - Bulk deactivate users
router.post('/bulk-deactivate', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.bulkDeactivate);
// POST /api/v1/users/bulk-assign-roles - Bulk assign roles
router.post('/bulk-assign-roles', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.bulkAssignRoles);
// Import/Export Routes (Admin only)
// GET /api/v1/users/export - Export users to CSV
router.get('/export', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.exportUsers);
// GET /api/v1/users/import/template - Download CSV template
router.get('/import/template', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.downloadTemplate);
// POST /api/v1/users/import/validate - Validate import file
router.post('/import/validate', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.validateImport);
// POST /api/v1/users/import - Import users from CSV
router.post('/import', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.importUsers);
exports.usersRouter = router;

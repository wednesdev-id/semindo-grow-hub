import { Router } from 'express'
import { UsersController } from '../controllers/users.controller'
import { authenticate, requireRole } from '../../middlewares/auth.middleware'
import { upload } from '../../utils/upload.service'

const router = Router()
const controller = new UsersController()

// Apply authentication to all routes
router.use(authenticate)

// Profile Management Routes (must come before /:id routes)
// GET /api/v1/users/me - Get current user profile
router.get('/me', controller.getCurrentUser)

// PATCH /api/v1/users/me - Update own profile
router.patch('/me', controller.updateOwnProfile)

// POST /api/v1/users/me/change-password - Change password
router.post('/me/change-password', controller.changePassword)

// POST /api/v1/users/me/upload-picture - Upload profile picture
router.post('/me/upload-picture', upload.single('picture'), controller.uploadProfilePicture)

// Admin Routes
// GET /api/v1/users - List users (Admin/SuperAdmin)
router.get('/', requireRole(['admin', 'super_admin']), controller.findAll)

// GET /api/v1/users/:id - Get user details
router.get('/:id', controller.findById)

// POST /api/v1/users - Create user (Admin/SuperAdmin)
router.post('/', requireRole(['admin', 'super_admin']), controller.create)

// PATCH /api/v1/users/:id - Update user
router.patch('/:id', controller.update)

// DELETE /api/v1/users/:id - Delete user (SuperAdmin only)
router.delete('/:id', requireRole(['admin', 'super_admin']), controller.delete)

// User-Role Management Routes (Admin only)
// POST /api/v1/users/:id/roles - Assign roles to user
router.post('/:id/roles', requireRole(['admin', 'super_admin']), controller.assignRoles)

// DELETE /api/v1/users/:id/roles/:roleId - Remove role from user
router.delete('/:id/roles/:roleId', requireRole(['admin', 'super_admin']), controller.removeRole)

// Bulk Operations Routes (Admin only)
// POST /api/v1/users/bulk-delete - Bulk delete users
router.post('/bulk-delete', requireRole(['admin', 'super_admin']), controller.bulkDelete)

// POST /api/v1/users/bulk-activate - Bulk activate users
router.post('/bulk-activate', requireRole(['admin', 'super_admin']), controller.bulkActivate)

// POST /api/v1/users/bulk-deactivate - Bulk deactivate users
router.post('/bulk-deactivate', requireRole(['admin', 'super_admin']), controller.bulkDeactivate)

// POST /api/v1/users/bulk-assign-roles - Bulk assign roles
router.post('/bulk-assign-roles', requireRole(['admin', 'super_admin']), controller.bulkAssignRoles)

// Import/Export Routes (Admin only)
// GET /api/v1/users/export - Export users to CSV
router.get('/export', requireRole(['admin', 'super_admin']), controller.exportUsers)

// GET /api/v1/users/import/template - Download CSV template
router.get('/import/template', requireRole(['admin', 'super_admin']), controller.downloadTemplate)

// POST /api/v1/users/import/validate - Validate import file
router.post('/import/validate', requireRole(['admin', 'super_admin']), controller.validateImport)

// POST /api/v1/users/import - Import users from CSV
router.post('/import', requireRole(['admin', 'super_admin']), controller.importUsers)

export const usersRouter = router

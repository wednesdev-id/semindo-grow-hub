import { Router } from 'express'
import { UsersController } from '../controllers/users.controller'
import { authenticate, requireRole } from '../../middlewares/auth.middleware'

const router = Router()
const controller = new UsersController()

// Apply authentication to all routes
router.use(authenticate)

// GET /api/v1/users - List users (Admin/SuperAdmin)
router.get('/', requireRole(['admin', 'super_admin']), controller.findAll)

// GET /api/v1/users/:id - Get user details
// TODO: Allow user to view their own profile
router.get('/:id', controller.findById)

// POST /api/v1/users - Create user (Admin/SuperAdmin)
router.post('/', requireRole(['admin', 'super_admin']), controller.create)

// PATCH /api/v1/users/:id - Update user
// TODO: Allow user to update their own profile
router.patch('/:id', controller.update)

// DELETE /api/v1/users/:id - Delete user (SuperAdmin only)
router.delete('/:id', requireRole(['super_admin']), controller.delete)

export const usersRouter = router

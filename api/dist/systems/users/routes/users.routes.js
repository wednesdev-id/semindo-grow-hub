"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new users_controller_1.UsersController();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// GET /api/v1/users - List users (Admin/SuperAdmin)
router.get('/', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.findAll);
// GET /api/v1/users/:id - Get user details
// TODO: Allow user to view their own profile
router.get('/:id', controller.findById);
// POST /api/v1/users - Create user (Admin/SuperAdmin)
router.post('/', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.create);
// PATCH /api/v1/users/:id - Update user
// TODO: Allow user to update their own profile
router.patch('/:id', controller.update);
// DELETE /api/v1/users/:id - Delete user (SuperAdmin only)
router.delete('/:id', (0, auth_middleware_1.requireRole)(['admin', 'super_admin']), controller.delete);
exports.usersRouter = router;

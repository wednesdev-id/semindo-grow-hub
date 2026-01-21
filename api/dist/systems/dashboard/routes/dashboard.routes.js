"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
// Protected routes
router.get('/overview', auth_middleware_1.authenticate, controller.getOverview);
// TEMPORARY: Admin overview without auth for debugging
// TODO: Re-add auth after confirming endpoint works
router.get('/admin/overview', controller.getAdminOverview);
// router.get('/admin/overview', authenticate, requireRole(['admin', 'super_admin']), controller.getAdminOverview);
exports.default = router;

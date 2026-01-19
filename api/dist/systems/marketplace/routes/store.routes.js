"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRouter = void 0;
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/stores/:slug', store_controller_1.storeController.getStoreBySlug);
// Protected routes
router.post('/stores', auth_middleware_1.authenticate, store_controller_1.storeController.createStore);
router.get('/stores/me', auth_middleware_1.authenticate, store_controller_1.storeController.getMyStore);
router.patch('/stores/me', auth_middleware_1.authenticate, store_controller_1.storeController.updateMyStore);
exports.storeRouter = router;

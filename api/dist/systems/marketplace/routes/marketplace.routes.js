"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceRouter = void 0;
const express_1 = require("express");
const marketplace_controller_1 = require("../controllers/marketplace.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new marketplace_controller_1.MarketplaceController();
// Public routes
router.get('/products', controller.findAllProducts);
router.get('/products/:slug', controller.findProductBySlug);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/products', controller.createProduct); // Seller only? For now, any auth user
router.post('/orders', controller.createOrder);
router.get('/orders', controller.getMyOrders);
router.get('/orders/:id', controller.getOrder);
router.patch('/orders/:id/status', controller.updateOrderStatus); // Admin/Seller only? Add middleware later
router.patch('/orders/:id/shipment', controller.updateShipment);
// Analytics
router.get('/analytics/seller', controller.getSellerAnalytics);
router.get('/analytics/admin', controller.getAdminAnalytics);
// Product Management
router.get('/my-products', controller.getMyProducts);
router.patch('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);
router.post('/products/:id/sync', controller.syncStock);
exports.marketplaceRouter = router;

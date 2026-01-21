"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceRouter = void 0;
const express_1 = require("express");
const marketplace_controller_1 = require("../controllers/marketplace.controller");
const webhook_controller_1 = require("../controllers/webhook.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new marketplace_controller_1.MarketplaceController();
const webhookController = new webhook_controller_1.WebhookController();
// Public routes
router.get('/products', controller.findAllProducts);
router.get('/search', controller.searchProducts);
router.get('/products/categories', controller.getCategories);
router.get('/products/top-sellers', controller.getTopSellers);
router.get('/products/:slug', controller.findProductBySlug);
router.post('/payment/callback', controller.processPayment); // Mock Payment Callback (Keep for backward compat?)
router.post('/payment/notification', webhookController.handleMidtransNotification); // Real Midtrans Webhook
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/orders/:id/cancel', controller.cancelOrder); // Prioritize specific sub-resource routes
router.post('/products', controller.createProduct); // Seller only? For now, any auth user
router.post('/orders', controller.createOrder);
router.get('/orders', controller.getMyOrders);
router.get('/seller/orders', controller.getSellerOrders); // NEW: Seller-specific order list
router.get('/orders/:id', controller.getOrder);
router.patch('/orders/:id/status', controller.updateOrderStatus); // Admin/Seller only? Add middleware later
router.post('/orders/:id/check-payment', controller.checkPaymentStatus); // System polling endpoint
router.patch('/orders/:id/shipment', controller.updateShipment);
router.post('/orders/:id/shipment/status', controller.updateShipmentStatus);
// Product image & status management (protected)
router.patch('/products/:id/status', controller.updateProductStatus);
router.post('/products/:id/images', controller.attachImagesToProduct);
router.patch('/products/:id/images/order', controller.reorderProductImages);
router.patch('/products/:id/images/:imageId/thumbnail', controller.setProductImageThumbnail);
router.delete('/products/:id/images/:imageId', controller.deleteProductImage);
// Analytics
router.get('/analytics/seller', controller.getSellerAnalytics);
router.get('/analytics/admin', controller.getAdminAnalytics);
router.get('/admin/products', controller.getAdminProducts);
router.patch('/admin/products/:id/approve', controller.approveProduct);
router.patch('/admin/products/:id/reject', controller.rejectProduct);
router.get('/consultant/clients/products', auth_middleware_1.authenticate, controller.getConsultantClientsProducts);
router.get('/partner/opportunities', auth_middleware_1.authenticate, controller.getExportReadyProducts);
router.get('/bank/candidates', auth_middleware_1.authenticate, controller.getFinancingCandidates);
// Product Management
router.get('/my-products', controller.getMyProducts);
router.patch('/products/:id', controller.updateProduct);
router.patch('/products/:id/archive', controller.archiveProduct);
router.delete('/products/:id', controller.deleteProduct);
router.post('/products/:id/sync', controller.syncStock);
exports.marketplaceRouter = router;

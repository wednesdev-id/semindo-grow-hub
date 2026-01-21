"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const marketplace_service_1 = require("../services/marketplace.service");
const marketplaceService = new marketplace_service_1.MarketplaceService();
class MarketplaceController {
    async createProduct(req, res) {
        try {
            const userId = req.user.id;
            const product = await marketplaceService.createProduct(userId, req.body);
            res.status(201).json({ data: product });
        }
        catch (error) {
            console.error('[MarketplaceController] createProduct error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async findAllProducts(req, res) {
        try {
            const { skip, take, category, search, minPrice, maxPrice } = req.query;
            const where = {
                isPublished: true,
            };
            if (category)
                where.category = String(category);
            if (search) {
                where.OR = [
                    { title: { contains: String(search), mode: 'insensitive' } },
                    { description: { contains: String(search), mode: 'insensitive' } },
                ];
            }
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice)
                    where.price.gte = Number(minPrice);
                if (maxPrice)
                    where.price.lte = Number(maxPrice);
            }
            const products = await marketplaceService.findAllProducts({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                where,
                orderBy: { createdAt: 'desc' },
            });
            res.json({ data: products });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    /**
     * Search and filter products with pagination
     * GET /api/v1/marketplace/search
     */
    async searchProducts(req, res) {
        try {
            const { search, category, minPrice, maxPrice, stockStatus, sortBy, page, limit, } = req.query;
            // Build params with defaults
            const params = {
                search: search ? String(search) : undefined,
                category: category ? String(category) : undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                stockStatus: stockStatus || 'all',
                sortBy: sortBy || 'newest',
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            };
            // Call service
            const result = await marketplaceService.searchProducts(params);
            res.json(result);
        }
        catch (error) {
            console.error('[MarketplaceController] searchProducts error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async findProductBySlug(req, res) {
        try {
            const { slug } = req.params;
            const product = await marketplaceService.findProductBySlug(slug);
            if (!product)
                return res.status(404).json({ error: 'Product not found' });
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async createOrder(req, res) {
        try {
            const userId = req.user.id;
            const { items, shippingAddress, shippingCost, paymentMethod } = req.body;
            const courier = shippingAddress?.courier;
            const order = await marketplaceService.createOrder(userId, items, shippingAddress, courier, shippingCost, paymentMethod);
            res.status(201).json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMyOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await marketplaceService.getMyOrders(userId);
            res.json({ data: orders });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getSellerOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await marketplaceService.getSellerOrders(userId);
            res.json({ data: orders });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async archiveProduct(req, res) {
        try {
            const userId = req.user.id;
            const product = await marketplaceService.archiveProduct(req.params.id, userId);
            res.json(product);
        }
        catch (error) {
            console.error('Failed to archive product:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async updateProduct(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const product = await marketplaceService.updateProduct(id, userId, req.body);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteProduct(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await marketplaceService.deleteProduct(id, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMyProducts(req, res) {
        try {
            const userId = req.user.id;
            const { search, category, stockStatus, sortBy, minPrice, maxPrice } = req.query;
            const params = {
                search: search ? String(search) : undefined,
                category: category ? String(category) : undefined,
                stockStatus: stockStatus ? String(stockStatus) : undefined,
                sortBy: sortBy ? String(sortBy) : undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
            };
            const products = await marketplaceService.getMyProducts(userId, params);
            res.json({ data: products });
        }
        catch (error) {
            console.error('[MarketplaceController] getMyProducts error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async getOrder(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const order = await marketplaceService.getOrder(id, userId);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;
            const order = await marketplaceService.updateOrderStatus(id, status, userId);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.user.id;
            const order = await marketplaceService.cancelOrder(id, userId, reason);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateShipment(req, res) {
        try {
            const { id } = req.params; // Order ID
            const { trackingNumber, courier } = req.body;
            const order = await marketplaceService.updateShipment(id, trackingNumber, courier);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateShipmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, location } = req.body;
            // In real app: Verify admin/seller or system role
            const order = await marketplaceService.updateShipmentStatus(id, status, location);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async syncStock(req, res) {
        try {
            const { id } = req.params;
            const result = await marketplaceService.syncStock(id);
            res.json({ data: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getSellerAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const data = await marketplaceService.getSellerAnalytics(userId);
            res.json({ data });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAdminAnalytics(req, res) {
        try {
            // In a real app, check for admin role here
            const data = await marketplaceService.getAdminAnalytics();
            res.json({ data });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async approveProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await marketplaceService.approveProduct(id);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async rejectProduct(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            if (!reason)
                throw new Error("Rejection reason is required");
            const product = await marketplaceService.rejectProduct(id, reason);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getConsultantClientsProducts(req, res) {
        try {
            const consultantId = req.user.id;
            const { search, clientId, status, page, limit } = req.query;
            const params = {
                search: search ? String(search) : undefined,
                clientId: clientId ? String(clientId) : undefined,
                status: status ? String(status) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            };
            const result = await marketplaceService.getConsultantClientsProducts(consultantId, params);
            res.json(result);
        }
        catch (error) {
            console.error('[MarketplaceController] getConsultantClientsProducts error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async getAdminProducts(req, res) {
        try {
            const { search, category, status, sellerId, sortBy, page, limit, startDate, endDate } = req.query;
            const params = {
                search: search ? String(search) : undefined,
                category: category ? String(category) : undefined,
                status: status ? String(status) : undefined,
                sellerId: sellerId ? String(sellerId) : undefined,
                sortBy: sortBy ? String(sortBy) : 'newest',
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
                startDate: startDate ? new Date(String(startDate)) : undefined,
                endDate: endDate ? new Date(String(endDate)) : undefined,
            };
            const result = await marketplaceService.getAdminProducts(params);
            res.json(result);
        }
        catch (error) {
            console.error('[MarketplaceController] getAdminProducts error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async getPendingProducts(req, res) {
        try {
            // In real app, check for admin role
            const products = await marketplaceService.getPendingProducts();
            res.json({ data: products });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async verifyProduct(req, res) {
        try {
            const { id } = req.params;
            const { approved } = req.body;
            const product = await marketplaceService.verifyProduct(id, approved);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getCategories(req, res) {
        try {
            const categories = await marketplaceService.getCategories();
            res.json({ data: categories });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getTopSellers(req, res) {
        try {
            const sellers = await marketplaceService.getTopSellers();
            res.json({ data: sellers });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateProductStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;
            const product = await marketplaceService.updateProductStatus(id, status, userId);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async attachImagesToProduct(req, res) {
        try {
            const { id } = req.params;
            const { images } = req.body;
            const userId = req.user.id;
            const product = await marketplaceService.attachImagesToProduct(id, images, userId);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async reorderProductImages(req, res) {
        try {
            const { id } = req.params;
            const { images } = req.body;
            const userId = req.user.id;
            const product = await marketplaceService.reorderProductImages(id, images, userId);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async setProductImageThumbnail(req, res) {
        try {
            const { id, imageId } = req.params;
            const userId = req.user.id;
            const product = await marketplaceService.setProductImageThumbnail(id, imageId, userId);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteProductImage(req, res) {
        try {
            const { id, imageId } = req.params;
            const userId = req.user.id;
            const product = await marketplaceService.deleteProductImage(id, userId, imageId);
            res.json({ data: product });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getExportReadyProducts(req, res) {
        try {
            const { page, limit, category, region } = req.query;
            const params = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
                category: category ? String(category) : undefined,
                region: region ? String(region) : undefined,
            };
            const result = await marketplaceService.getExportReadyProducts(params);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getFinancingCandidates(req, res) {
        try {
            const { page, limit, minRevenue, location } = req.query;
            const params = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
                minRevenue: minRevenue ? Number(minRevenue) : undefined,
                location: location ? String(location) : undefined,
            };
            const result = await marketplaceService.getFinancingCandidates(params);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async processPayment(req, res) {
        try {
            const { orderId, status } = req.body;
            // Validate status enum if needed: 'success' | 'failed' | 'expired'
            const result = await marketplaceService.processPayment(orderId, status);
            res.json({ data: result });
        }
        catch (error) {
            console.error('[MarketplaceController] processPayment error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    async checkPaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const order = await marketplaceService.checkPaymentStatus(id);
            res.json({ data: order });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.MarketplaceController = MarketplaceController;

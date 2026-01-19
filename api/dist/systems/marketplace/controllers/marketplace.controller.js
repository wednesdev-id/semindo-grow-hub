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
            const { items } = req.body; // items: [{ productId, quantity }]
            const order = await marketplaceService.createOrder(userId, items);
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
            const products = await marketplaceService.getMyProducts(userId);
            res.json({ data: products });
        }
        catch (error) {
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
}
exports.MarketplaceController = MarketplaceController;

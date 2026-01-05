import { Request, Response } from 'express'
import { MarketplaceService } from '../services/marketplace.service';
import { Prisma } from '@prisma/client';

const marketplaceService = new MarketplaceService();

export class MarketplaceController {
    async createProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const product = await marketplaceService.createProduct(userId, req.body);
            res.status(201).json({ data: product });
        } catch (error: any) {
            console.error('[MarketplaceController] createProduct error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async findAllProducts(req: Request, res: Response) {
        try {
            const { skip, take, category, search, minPrice, maxPrice } = req.query;

            const where: Prisma.ProductWhereInput = {
                isPublished: true,
            };

            if (category) where.category = String(category);
            if (search) {
                where.OR = [
                    { title: { contains: String(search), mode: 'insensitive' } },
                    { description: { contains: String(search), mode: 'insensitive' } },
                ];
            }
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.gte = Number(minPrice);
                if (maxPrice) where.price.lte = Number(maxPrice);
            }

            const products = await marketplaceService.findAllProducts({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                where,
                orderBy: { createdAt: 'desc' },
            });
            res.json({ data: products });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findProductBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const product = await marketplaceService.findProductBySlug(slug);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async createOrder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { items } = req.body; // items: [{ productId, quantity }]
            const order = await marketplaceService.createOrder(userId, items);
            res.status(201).json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const orders = await marketplaceService.getMyOrders(userId);
            res.json({ data: orders });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSellerOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const orders = await marketplaceService.getSellerOrders(userId);
            res.json({ data: orders });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async archiveProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const product = await marketplaceService.archiveProduct(req.params.id, userId);
            res.json(product);
        } catch (error: any) {
            console.error('Failed to archive product:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const product = await marketplaceService.updateProduct(id, userId, req.body);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            await marketplaceService.deleteProduct(id, userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyProducts(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const products = await marketplaceService.getMyProducts(userId);
            res.json({ data: products });
        } catch (error: any) {
            console.error('[MarketplaceController] getMyProducts error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getOrder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const order = await marketplaceService.getOrder(id, userId);
            res.json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = (req as any).user.id;

            const order = await marketplaceService.updateOrderStatus(id, status, userId);
            res.json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateShipment(req: Request, res: Response) {
        try {
            const { id } = req.params; // Order ID
            const { trackingNumber, courier } = req.body;

            const order = await marketplaceService.updateShipment(id, trackingNumber, courier);
            res.json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async syncStock(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await marketplaceService.syncStock(id);
            res.json({ data: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSellerAnalytics(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = await marketplaceService.getSellerAnalytics(userId);
            res.json({ data });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAdminAnalytics(req: Request, res: Response) {
        try {
            // In a real app, check for admin role here
            const data = await marketplaceService.getAdminAnalytics();
            res.json({ data });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPendingProducts(req: Request, res: Response) {
        try {
            // In real app, check for admin role
            const products = await marketplaceService.getPendingProducts();
            res.json({ data: products });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async verifyProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { approved } = req.body;
            const product = await marketplaceService.verifyProduct(id, approved);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findProductsByStore(req: Request, res: Response) {
        try {
            const { storeId } = req.params;
            const products = await marketplaceService.findProductsByStore(storeId);
            res.json({ data: products });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateProductStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = (req as any).user.id;
            const product = await marketplaceService.updateProductStatus(id, status, userId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async attachImagesToProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { images } = req.body;
            const userId = (req as any).user.id;
            const product = await marketplaceService.attachImagesToProduct(id, images, userId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async reorderProductImages(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { images } = req.body;
            const userId = (req as any).user.id;
            const product = await marketplaceService.reorderProductImages(id, images, userId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async setProductImageThumbnail(req: Request, res: Response) {
        try {
            const { id, imageId } = req.params;
            const userId = (req as any).user.id;
            const product = await marketplaceService.setProductImageThumbnail(id, imageId, userId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteProductImage(req: Request, res: Response) {
        try {
            const { id, imageId } = req.params;
            const userId = (req as any).user.id;
            const product = await marketplaceService.deleteProductImage(id, imageId, userId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

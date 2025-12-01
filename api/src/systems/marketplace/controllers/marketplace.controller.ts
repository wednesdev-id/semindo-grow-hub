import { Request, Response } from 'express';
import { MarketplaceService } from '../services/marketplace.service';
import { Prisma } from '@prisma/client';

const marketplaceService = new MarketplaceService();

export class MarketplaceController {
    async createProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const data: Prisma.ProductCreateInput = {
                ...req.body,
                seller: { connect: { id: userId } },
                slug: req.body.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            };
            const product = await marketplaceService.createProduct(data);
            res.status(201).json({ data: product });
        } catch (error: any) {
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
            const userId = (req as any).user.userId;
            const { items } = req.body; // items: [{ productId, quantity }]
            const order = await marketplaceService.createOrder(userId, items);
            res.status(201).json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const orders = await marketplaceService.getMyOrders(userId);
            res.json({ data: orders });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            const product = await marketplaceService.updateProduct(id, userId, req.body);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await marketplaceService.deleteProduct(id, userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyProducts(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const products = await marketplaceService.getMyProducts(userId);
            res.json({ data: products });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOrder(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
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
            const order = await marketplaceService.updateOrderStatus(id, status);
            res.json({ data: order });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

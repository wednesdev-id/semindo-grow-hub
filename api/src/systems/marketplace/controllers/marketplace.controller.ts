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
            const {
                skip,
                take,
                category,
                search,
                minPrice,
                maxPrice,
                inStock,
                sortBy,
                sortOrder
            } = req.query;

            // Parse query parameters
            const parsedMinPrice = minPrice ? Number(minPrice) : undefined;
            const parsedMaxPrice = maxPrice ? Number(maxPrice) : undefined;
            const parsedInStock = inStock === 'true' ? true : inStock === 'false' ? false : undefined;
            const parsedSortBy = sortBy as 'price' | 'createdAt' | 'rating' | 'soldCount' | 'viewCount' | undefined;
            const parsedSortOrder = sortOrder as 'asc' | 'desc' | undefined;

            // Validate sortBy
            const validSortFields = ['price', 'createdAt', 'rating', 'soldCount', 'viewCount'];
            if (parsedSortBy && !validSortFields.includes(parsedSortBy)) {
                return res.status(400).json({
                    error: `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`
                });
            }

            // Validate sortOrder
            if (parsedSortOrder && !['asc', 'desc'].includes(parsedSortOrder)) {
                return res.status(400).json({
                    error: 'Invalid sortOrder. Must be either "asc" or "desc"'
                });
            }

            const products = await marketplaceService.findAllProducts({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                search: search ? String(search) : undefined,
                category: category ? String(category) : undefined,
                minPrice: parsedMinPrice,
                maxPrice: parsedMaxPrice,
                inStock: parsedInStock,
                sortBy: parsedSortBy,
                sortOrder: parsedSortOrder,
            });

            res.json({ data: products });
        } catch (error: any) {
            console.error('[MarketplaceController] findAllProducts error:', error);
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
            const product = await marketplaceService.deleteProductImage(id, userId, imageId);
            res.json({ data: product });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }


    async getCategories(req: Request, res: Response) {
        try {
            const categories = await marketplaceService.getCategories();
            res.json({ data: categories });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getTopSellers(req: Request, res: Response) {
        try {
            const sellers = await marketplaceService.getTopSellers();
            res.json({ data: sellers });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

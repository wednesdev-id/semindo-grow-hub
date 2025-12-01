import { Product, Order, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class MarketplaceService {
    async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
        return prisma.product.create({
            data,
        });
    }

    async findAllProducts(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
    }): Promise<Product[]> {
        const { skip, take, where, orderBy } = params;
        return prisma.product.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                    },
                },
            },
        });
    }

    async findProductBySlug(slug: string): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { slug },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                    },
                },
            },
        });
    }

    async createOrder(userId: string, items: { productId: string; quantity: number }[]): Promise<Order> {
        // Calculate total amount and verify stock
        let totalAmount = 0;
        const orderItemsData: any[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.title}`);

            totalAmount += Number(product.price) * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        return prisma.$transaction(async (tx) => {
            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // Update stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return order;
        });
    }

    async getMyOrders(userId: string): Promise<Order[]> {
        return prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateProduct(id: string, userId: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        return prisma.product.update({
            where: { id },
            data,
        });
    }

    async deleteProduct(id: string, userId: string): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        return prisma.product.delete({
            where: { id },
        });
    }

    async getMyProducts(userId: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOrder(id: string, userId: string): Promise<Order | null> {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    }
                }
            },
        });

        if (!order) return null;
        // Allow if user is the buyer OR the seller of ANY item in the order
        // For MVP, let's just check if user is buyer. Seller view might need more complex logic or separate endpoint.
        // Actually, for "My Orders" detail, it's the buyer.
        if (order.userId !== userId) {
            // Check if user is seller of any product in the order?
            // For now, strict check for buyer.
            // TODO: Allow sellers to view orders containing their products.
            throw new Error('Unauthorized');
        }

        return order;
    }

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    }
}

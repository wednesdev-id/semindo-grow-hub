import { PrismaClient, Product, Order, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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
}

import { Product, Order, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { paymentService } from './payment.service';
import { shopeeAdapter, tokopediaAdapter } from '../adapters/mock.adapter';
import { options } from 'pdfkit';

// Order Status Enum
enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

// Valid status transitions - state machine
const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['completed'],
    completed: [], // Terminal state
    cancelled: []  // Terminal state
};

export class MarketplaceService {
    async createProduct(userId: string, data: any): Promise<Product> {
        // Get user's store
        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) throw new Error('User does not have a store. Please create a store first.');

        const productData = data;

        // Generate slug
        const baseSlug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Date.now()}`;

        return prisma.product.create({
            data: {
                ...productData,
                slug,
                storeId: store.id,
                sellerId: userId, // Keep for legacy compatibility
            }
        });
    }



    async findAllProducts(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
        // New search and filter parameters
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
        sortBy?: 'price' | 'createdAt' | 'rating' | 'soldCount' | 'viewCount';
        sortOrder?: 'asc' | 'desc';
    }): Promise<Product[]> {
        const {
            skip,
            take,
            where,
            orderBy,
            search,
            category,
            minPrice,
            maxPrice,
            inStock,
            sortBy,
            sortOrder
        } = params;

        // Build dynamic where clause
        const dynamicWhere: Prisma.ProductWhereInput = {
            ...where,
        };

        // Search by product title or description
        if (search) {
            dynamicWhere.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filter by category
        if (category) {
            dynamicWhere.category = category;
        }

        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            dynamicWhere.price = {};
            if (minPrice !== undefined) {
                dynamicWhere.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                dynamicWhere.price.lte = maxPrice;
            }
        }

        // Filter by stock status
        if (inStock !== undefined) {
            if (inStock) {
                dynamicWhere.stock = { gt: 0 };
            } else {
                dynamicWhere.stock = { lte: 0 };
            }
        }

        // Build dynamic orderBy clause
        let dynamicOrderBy: Prisma.ProductOrderByWithRelationInput = orderBy || { createdAt: 'desc' };

        if (sortBy) {
            const order = sortOrder || 'desc';
            dynamicOrderBy = { [sortBy]: order };
        }

        // If where clause already has deletedAt filter (admin view), don't add isPublished filter
        const hasDeletedAtFilter = where && 'deletedAt' in where;

        return prisma.product.findMany({
            skip,
            take,
            where: hasDeletedAtFilter ? dynamicWhere : {
                ...dynamicWhere,
                deletedAt: null,
                isPublished: true // Only show published products for public
            },
            orderBy: dynamicOrderBy,
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        rating: true,
                    }
                },
            },
        });
    }


    async findProductBySlug(slug: string): Promise<Product | null> {
        return prisma.product.findFirst({
            where: { slug, deletedAt: null },
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
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product || product.deletedAt) throw new Error(`Product ${item.productId} not found or no longer available`);

            let price = Number(product.price);
            let stock = product.stock;

            if (stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.title}`);
            }

            totalAmount += price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: price,
                name: product.title,
            });
        }

        return prisma.$transaction(async (tx) => {
            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    paymentLink: '', // Will be updated
                    paymentStatus: 'pending',
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
                    user: true, // Include user to get details for payment
                },
            });

            // Generate payment link
            // Note: In a real transaction, we might want to do this outside the prisma transaction 
            // or handle failure gracefully. For now, we update the order with the link.
            // We need user details.
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('User not found');

            const { paymentLink } = await paymentService.createPaymentLink(order, {
                name: user.fullName || 'Customer',
                email: user.email
            });

            await tx.order.update({
                where: { id: order.id },
                data: { paymentLink }
            });

            // Update stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // Clear cart items if they exist
            // We can optionally clear the cart here if we assume checkout always comes from cart
            // But for flexibility, let's keep it separate or handle it if requested.
            // For now, let's assume the frontend calls clearCart or we can do it here if we had cartId.
            // Since we only have userId, we could clear all items for this user that match the order items.

            await tx.cartItem.deleteMany({
                where: {
                    cart: { userId },
                    productId: { in: items.map(i => i.productId) },
                    // This is a bit simplistic, might delete items not in this specific order if duplicates exist (unlikely in cart)
                }
            });

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

        // Handle Status Logic
        if (typeof data.status === 'string') {
            const newStatus = data.status;

            // Sync isPublished based on status
            if (newStatus === 'active') { // 'active' = Published
                data.isPublished = true;
            } else if (['draft', 'archived', 'suspended'].includes(newStatus)) {
                data.isPublished = false;
            }
        }

        return prisma.product.update({
            where: { id },
            data,
        });
    }

    async archiveProduct(id: string, userId: string): Promise<Product> {
        return this.updateProduct(id, userId, {
            status: 'archived',
            isPublished: false
        });
    }

    async deleteProduct(id: string, userId: string): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        return prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isPublished: false // Also unpublish on delete
            },
        });
    }

    async getMyProducts(userId: string): Promise<Product[]> {
        const store = await prisma.store.findFirst({ where: { userId } });

        // Find products belonging to the store OR directly to the user (legacy/transitional)
        return prisma.product.findMany({
            where: {
                OR: [
                    store ? { storeId: store.id } : {},
                    { sellerId: userId }
                ],
                deletedAt: null
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                        umkmProfile: {
                            select: { city: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getOrder(id: string, userId: string): Promise<Order | null> {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                store: true // Include store to check seller ownership
                            }
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    }
                },
                shipment: true,
                payment: true,
            },
        });

        if (!order) return null;

        // Allow if user is the buyer
        if (order.userId === userId) return order;

        // Allow if user is seller of any product in the order
        const isSeller = order.items.some(
            item => item.product.store?.userId === userId
        );
        if (isSeller) return order;

        throw new Error('Unauthorized: You can only view orders you placed or orders containing your products');
    }

    async updateOrderStatus(id: string, newStatus: string, userId: string): Promise<Order> {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                store: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) throw new Error('Order not found');

        // Verify user is seller of any product in the order
        const isSeller = order.items.some(
            item => item.product.store?.userId === userId
        );
        if (!isSeller) throw new Error('Unauthorized: Only sellers can update order status');

        // Validate status transition using state machine
        const validNextStatuses = VALID_TRANSITIONS[order.status] || [];
        if (!validNextStatuses.includes(newStatus)) {
            throw new Error(
                `Invalid status transition: Cannot change from "${order.status}" to "${newStatus}". ` +
                `Valid next statuses are: ${validNextStatuses.join(', ') || 'none (terminal state)'}`
            );
        }

        return prisma.order.update({
            where: { id },
            data: { status: newStatus },
        });
    }

    async updateShipment(orderId: string, trackingNumber: string, courier: string): Promise<Order> {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order) throw new Error('Order not found');

            // Update or create shipment
            const shipment = await tx.shipment.upsert({
                where: { orderId },
                create: {
                    orderId,
                    courier,
                    service: 'Standard', // Default for now
                    trackingNumber,
                    status: 'shipped',
                    shippedAt: new Date(),
                },
                update: {
                    courier,
                    trackingNumber,
                    status: 'shipped',
                    shippedAt: new Date(),
                }
            });

            // Update order status to shipped
            return tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'shipped',
                    trackingNumber,
                    courier
                },
                include: {
                    shipment: true
                }
            });
        });
    }

    async syncStock(productId: string): Promise<{ success: boolean; newStock: number }> {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error('Product not found');

        // In a real scenario, we would iterate over connected channels for this product/store
        // For now, we simulate syncing with both adapters

        await shopeeAdapter.syncStock(productId, product.stock);
        await tokopediaAdapter.syncStock(productId, product.stock);

        return {
            success: true,
            newStock: product.stock
        };
    }

    async getSellerAnalytics(userId: string) {
        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) throw new Error('Store not found');

        const totalOrders = await prisma.order.count({
            where: { storeId: store.id }
        });

        const completedOrders = await prisma.order.aggregate({
            where: {
                storeId: store.id,
                status: 'completed'
            },
            _sum: { totalAmount: true }
        });

        const totalSales = Number(completedOrders._sum.totalAmount || 0);

        const products = await prisma.product.count({
            where: { storeId: store.id }
        });

        const recentOrders = await prisma.order.findMany({
            where: {
                OR: [
                    { storeId: store.id },
                    { items: { some: { product: { sellerId: userId } } } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { fullName: true } } }
        });

        // Mock monthly sales data for chart
        const monthlySales = [
            { name: 'Jan', total: Math.floor(Math.random() * 5000000) },
            { name: 'Feb', total: Math.floor(Math.random() * 5000000) },
            { name: 'Mar', total: Math.floor(Math.random() * 5000000) },
            { name: 'Apr', total: Math.floor(Math.random() * 5000000) },
            { name: 'May', total: Math.floor(Math.random() * 5000000) },
            { name: 'Jun', total: Math.floor(Math.random() * 5000000) },
        ];

        return {
            totalOrders,
            totalSales,
            totalProducts: products,
            recentOrders,
            monthlySales
        };
    }

    async getSellerOrders(userId: string): Promise<Order[]> {
        // Get user's store
        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return [];

        // Find all orders that contain products from this seller's store
        return prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            storeId: store.id
                        }
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                images: true,
                                price: true,
                                storeId: true,
                            }
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    }
                },
                shipment: {
                    select: {
                        status: true,
                        trackingNumber: true,
                        courier: true,
                    }
                },
                payment: {
                    select: {
                        status: true,
                        method: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAdminAnalytics() {
        const totalOrders = await prisma.order.count();

        const allSales = await prisma.order.aggregate({
            where: { status: 'completed' },
            _sum: {
                totalAmount: true,
                platformFee: true
            }
        });

        const totalSales = Number(allSales._sum.totalAmount || 0);
        const totalFees = Number(allSales._sum.platformFee || 0);

        const activeStores = await prisma.store.count({
            where: { isActive: true }
        });

        return {
            totalOrders,
            totalSales,
            totalFees,
            activeStores
        };
    }

    async getPendingProducts() {
        return prisma.product.findMany({
            where: {
                isPublished: false,
                status: 'draft'
            },
            include: {
                seller: {
                    select: {
                        fullName: true,
                        businessName: true
                    }
                },
                store: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async verifyProduct(id: string, approved: boolean) {
        return prisma.product.update({
            where: { id },
            data: {
                isPublished: approved,
                status: approved ? 'active' : 'rejected'
            }
        });
    }

    async findProductsByStore(storeId: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { storeId, deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateProductStatus(id: string, userId: string, status: string): Promise<Product> {
        return this.updateProduct(id, userId, { status });
    }

    async attachImagesToProduct(id: string, userId: string, newImages: string[]): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        const currentImages = Array.isArray(product.images) ? (product.images as string[]) : [];
        const updatedImages = [...currentImages, ...newImages];

        return prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });
    }

    async reorderProductImages(id: string, userId: string, images: string[]): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        return prisma.product.update({
            where: { id },
            data: { images }
        });
    }

    async setProductImageThumbnail(id: string, userId: string, imageUrl: string): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        let currentImages = Array.isArray(product.images) ? (product.images as string[]) : [];

        // Remove the image if it exists and unshift it to the front
        currentImages = currentImages.filter(img => img !== imageUrl);
        currentImages.unshift(imageUrl);

        return prisma.product.update({
            where: { id },
            data: { images: currentImages }
        });
    }

    async deleteProductImage(id: string, userId: string, imageUrl: string): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        if (product.sellerId !== userId) throw new Error('Unauthorized');

        const currentImages = Array.isArray(product.images) ? (product.images as string[]) : [];
        const updatedImages = currentImages.filter(img => img !== imageUrl);

        return prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });
    }


    async getCategories() {
        const categories = await prisma.product.groupBy({
            by: ['category'],
            where: { deletedAt: null, isPublished: true },
            _count: {
                _all: true
            }
        });

        return categories.map(c => ({
            id: c.category,
            name: c.category,
            count: c._count._all
        }));
    }

    async getTopSellers() {
        const topStores = await prisma.store.findMany({
            where: { isActive: true },
            take: 10,
            include: {
                _count: {
                    select: {
                        products: true,
                        orders: {
                            where: { status: 'completed' }
                        }
                    }
                },
                user: {
                    select: {
                        fullName: true,
                        businessName: true,
                        profilePictureUrl: true,
                        umkmProfile: {
                            select: {
                                city: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                orders: {
                    _count: 'desc'
                }
            }
        });

        return topStores.map(s => ({
            id: s.id,
            name: s.name,
            location: s.user?.umkmProfile?.city || 'Indramayu',
            products: s._count.products,
            rating: Number(s.rating) || 0,
            totalSales: String(s._count.orders),
            verified: s.isActive,
            image: s.logoUrl || s.user?.profilePictureUrl || '/api/placeholder/80/80'
        }));
    }
}

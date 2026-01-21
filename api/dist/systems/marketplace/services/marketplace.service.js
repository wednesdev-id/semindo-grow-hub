"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const prisma_1 = require("../../../lib/prisma");
const payment_service_1 = require("./payment.service");
// Order Status Enum
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PAID"] = "paid";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
// Valid status transitions - state machine
const VALID_TRANSITIONS = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['completed'],
    completed: [], // Terminal state
    cancelled: [] // Terminal state
};
class MarketplaceService {
    async createProduct(userId, data) {
        // Get user's store
        const store = await prisma_1.prisma.store.findUnique({ where: { userId } });
        if (!store)
            throw new Error('User does not have a store. Please create a store first.');
        // Generate slug
        const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        return prisma_1.prisma.product.create({
            data: {
                ...data,
                slug,
                storeId: store.id,
                sellerId: userId, // Keep for legacy compatibility
            }
        });
    }
    async findAllProducts(params) {
        const { skip, take, where, orderBy, search, category, minPrice, maxPrice, inStock, sortBy, sortOrder } = params;
        // Build dynamic where clause
        const dynamicWhere = {
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
            }
            else {
                dynamicWhere.stock = { lte: 0 };
            }
        }
        // Build dynamic orderBy clause
        let dynamicOrderBy = orderBy || { createdAt: 'desc' };
        if (sortBy) {
            const order = sortOrder || 'desc';
            dynamicOrderBy = { [sortBy]: order };
        }
        // If where clause already has deletedAt filter (admin view), don't add isPublished filter
        const hasDeletedAtFilter = where && 'deletedAt' in where;
        return prisma_1.prisma.product.findMany({
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
    /**
     * Search and filter products with pagination
     * New method using ProductSearchDto
     */
    async searchProducts(params) {
        const { search, category, minPrice, maxPrice, stockStatus = 'all', sortBy = 'newest', page = 1, limit = 20, sellerId, status } = params;
        // Build where clause
        const where = {
            deletedAt: null,
            isPublished: true,
        };
        // Search by title or description
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Filter by category
        if (category) {
            where.category = category;
        }
        // Filter by price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        // Filter by stock status
        if (stockStatus === 'in_stock') {
            where.stock = { gt: 0 };
        }
        else if (stockStatus === 'low_stock') {
            where.AND = [
                { stock: { gt: 0 } },
                { stock: { lt: 10 } }
            ];
        }
        else if (stockStatus === 'out_of_stock') {
            where.stock = { lte: 0 };
        }
        // Filter by seller (for admin/specific use cases)
        if (sellerId) {
            where.sellerId = sellerId;
        }
        // Filter by status (for admin)
        if (status) {
            if (status === 'active') {
                where.isPublished = true;
            }
            else if (status === 'inactive') {
                where.isPublished = false;
            }
        }
        // Build orderBy clause
        let orderBy = { createdAt: 'desc' };
        switch (sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'popular':
                orderBy = { viewCount: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Execute query with count
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
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
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        // Return formatted response
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages
            },
            filters: {
                search,
                category,
                minPrice,
                maxPrice,
                stockStatus,
                sortBy
            }
        };
    }
    /**
     * Admin: Get comprehensive list of products with filters
     */
    async getAdminProducts(params) {
        const { search, category, status, sellerId, sortBy, page = 1, limit = 20, startDate, endDate } = params;
        const skip = (page - 1) * limit;
        const where = {};
        // Filter by Status (Default to all except deleted if not specified, but for admin we might want to see drafts too)
        if (status) {
            where.status = status;
        }
        // Search
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Filters
        if (category)
            where.category = category;
        if (sellerId)
            where.storeId = sellerId;
        // Status Logic
        if (status) {
            switch (status) {
                case 'active':
                    where.isPublished = true;
                    break;
                case 'draft':
                    where.status = 'draft';
                    break;
                case 'inactive':
                    where.isPublished = false;
                    break;
                case 'archived':
                    where.status = 'archived';
                    break;
                case 'rejected':
                    where.status = 'rejected';
                    break;
            }
        }
        // Date Range
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        // Sorting
        let orderBy = { createdAt: 'desc' };
        switch (sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'oldest':
                orderBy = { createdAt: 'asc' };
                break;
            case 'name_asc':
                orderBy = { title: 'asc' };
                break;
            case 'name_desc':
                orderBy = { title: 'desc' };
                break;
            case 'newest':
            default: orderBy = { createdAt: 'desc' };
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    store: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findProductBySlug(slug) {
        return prisma_1.prisma.product.findFirst({
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
    async createOrder(userId, items, shippingAddress, courier, shippingCost = 0, paymentMethod) {
        // Calculate total amount and verify stock
        let subtotal = 0;
        const orderItemsData = [];
        for (const item of items) {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: item.productId }
            });
            if (!product || product.deletedAt)
                throw new Error(`Product ${item.productId} not found or no longer available`);
            let price = Number(product.price);
            let stock = product.stock;
            if (stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.title}`);
            }
            subtotal += price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: price, // Store as number if schema expects Decimal/String, Prisma handles it usually, but let's be careful. Schema says Decimal? No, price is Decimal in DB.
                name: product.title,
            });
        }
        const totalAmount = subtotal + shippingCost;
        // SLA: 24 hours expiry for standard orders
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 24);
        return prisma_1.prisma.$transaction(async (tx) => {
            // Create order - Phase 2: Reservasi Stok & State "Menunggu Pembayaran"
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    shippingCost,
                    paymentLink: '', // Will be updated
                    paymentStatus: 'pending',
                    paymentMethod, // Save chosen method
                    status: 'pending', // Revert to 'pending' to match VALID_TRANSITIONS and existing logic
                    shippingAddress,
                    courier,
                    expiryTime, // Phase 2: SLA Timer start
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
                    user: true,
                },
            });
            // Update stock (Inventory Locking)
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            // Generate payment link
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new Error('User not found');
            const { paymentLink, paymentToken, paymentGateway, paymentData } = await payment_service_1.paymentService.createPaymentLink(order, order.paymentMethod || 'bca_va');
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    paymentLink,
                    paymentToken,
                    paymentGateway,
                    paymentData
                }
            });
            // Clear cart items
            await tx.cartItem.deleteMany({
                where: {
                    cart: { userId },
                    productId: { in: items.map(i => i.productId) },
                }
            });
            return updatedOrder;
        });
    }
    /**
     * Process Payment Result (Phase 4 & 5)
     * Handles transitions from PENDING_PAYMENT -> PAID or FAILURE
     */
    async processPayment(orderId, status) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
        if (!order)
            throw new Error('Order not found');
        // Idempotency check
        if (order.status === 'paid' || order.status === 'getting_packed')
            return order;
        if (order.status === 'cancelled')
            throw new Error('Order already cancelled');
        return prisma_1.prisma.$transaction(async (tx) => {
            if (status === 'success') {
                // Phase 4 & 5: Validation Final (Saldo Cukup) & Success
                // Update status to 'paid' (Pesanan Diterima/Paid)
                // Optionally 'getting_packed' if that's the immediate next step in your flow, but 'paid' is safer standard.
                return tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'paid',
                        paymentStatus: 'paid',
                        updatedAt: new Date()
                    }
                });
            }
            else if (status === 'failed') {
                // Payment failed (Saldo tidak cukup, dll)
                // User stays in pending unless explicit fail policies apply, 
                // but usually we just update paymentStatus to 'failed' and keep order 'pending' for retry
                // UNLESS user explicitly cancelled or max retries reached.
                // Request says: "User biasanya tetap berada di state Pending untuk mencoba kartu lain"
                return tx.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'failed', // Mark attempt failed
                        // status: 'pending' // Keep main status pending
                    }
                });
            }
            else if (status === 'expired') {
                // Phase 4: Validation Final (Waktu - SLA) -> Cancel
                // Restock items
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
                return tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'cancelled',
                        cancellationReason: 'Payment expired (SLA exceeded)',
                        cancelledAt: new Date(),
                        cancelledBy: 'system'
                    }
                });
            }
            return order;
        });
    }
    /**
     * System-Driven Verification (Polling/Check)
     * Called by frontend to check "Has this been paid?"
     */
    async checkPaymentStatus(orderId) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order)
            throw new Error('Order not found');
        // If already paid/cancelled, just return
        if (order.paymentStatus === 'paid' || order.status === 'cancelled') {
            return order;
        }
        // Extract paymentId from link (Hack for Mock)
        // Link format: .../payment-simulation/{paymentId}?orderId=...
        let paymentId = orderId; // Default fallback
        if (order.paymentLink) {
            const match = order.paymentLink.match(/\/payment-simulation\/([^\?]+)/);
            if (match && match[1]) {
                paymentId = match[1];
            }
        }
        // Verify with Gateway
        const status = await payment_service_1.paymentService.verifyPayment(paymentId);
        if (status === 'paid') {
            return this.processPayment(orderId, 'success');
        }
        else if (status === 'expired') {
            return this.processPayment(orderId, 'expired');
        }
        else if (status === 'failed') {
            // Update only paymentStatus, not order status (allow retries)
            return prisma_1.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'failed' }
            });
        }
        return order; // Still pending
    }
    async getMyOrders(userId) {
        return prisma_1.prisma.order.findMany({
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
    /**
     * Background Job: Check for expired orders
     * Phase 4: Validation Final (Waktu)
     */
    async checkExpiredOrders() {
        const now = new Date();
        // Find orders that are pending and expiryTime < now
        const expiredOrders = await prisma_1.prisma.order.findMany({
            where: {
                status: 'pending', // Must be pending payment
                expiryTime: {
                    lt: now
                }
            },
            select: { id: true }
        });
        if (expiredOrders.length === 0)
            return;
        console.log(`[MarketplaceService] Found ${expiredOrders.length} expired orders. Processing cancellations...`);
        for (const order of expiredOrders) {
            try {
                await this.processPayment(order.id, 'expired');
                console.log(`[MarketplaceService] Order ${order.id} cancelled due to expiration.`);
            }
            catch (error) {
                console.error(`[MarketplaceService] Failed to cancel expired order ${order.id}:`, error);
            }
        }
    }
    async updateProduct(id, userId, data) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        // Handle Status Logic
        if (typeof data.status === 'string') {
            const newStatus = data.status;
            // Sync isPublished based on status
            if (newStatus === 'active') { // 'active' = Published
                data.isPublished = true;
            }
            else if (['draft', 'archived', 'suspended'].includes(newStatus)) {
                data.isPublished = false;
            }
        }
        return prisma_1.prisma.product.update({
            where: { id },
            data,
        });
    }
    async archiveProduct(id, userId) {
        return this.updateProduct(id, userId, {
            status: 'archived',
            isPublished: false
        });
    }
    async deleteProduct(id, userId) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isPublished: false // Also unpublish on delete
            },
        });
    }
    async getMyProducts(userId, filters) {
        const store = await prisma_1.prisma.store.findFirst({ where: { userId } });
        // Base where clause for ownership
        const where = {
            OR: [
                store ? { storeId: store.id } : {},
                { sellerId: userId }
            ],
            deletedAt: null
        };
        // Apply Filters
        if (filters) {
            const { search, category, stockStatus, minPrice, maxPrice } = filters;
            if (search) {
                where.AND = [
                    ...(Array.isArray(where.AND) ? where.AND : []),
                    {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                ];
            }
            if (category) {
                where.category = category;
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {};
                if (minPrice !== undefined)
                    where.price.gte = minPrice;
                if (maxPrice !== undefined)
                    where.price.lte = maxPrice;
            }
            if (stockStatus) {
                if (stockStatus === 'in_stock') {
                    where.stock = { gt: 0 };
                }
                else if (stockStatus === 'low_stock') {
                    where.stock = { gt: 0, lt: 10 };
                }
                else if (stockStatus === 'out_of_stock') {
                    where.stock = { lte: 0 };
                }
            }
        }
        // Apply Sorting
        let orderBy = { createdAt: 'desc' };
        if (filters?.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'oldest':
                    orderBy = { createdAt: 'asc' };
                    break;
                case 'popular':
                    orderBy = { viewCount: 'desc' };
                    break; // Assuming viewCount exists
                case 'newest':
                default: orderBy = { createdAt: 'desc' };
            }
        }
        return prisma_1.prisma.product.findMany({
            where,
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                        umkmProfiles: {
                            select: { city: true }
                        }
                    }
                }
            },
            orderBy
        });
    }
    async getOrder(id, userId) {
        const order = await prisma_1.prisma.order.findUnique({
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
        if (!order)
            return null;
        // Allow if user is the buyer
        if (order.userId === userId)
            return order;
        // Allow if user is seller of any product in the order
        const isSeller = order.items.some(item => item.product.store?.userId === userId);
        if (isSeller)
            return order;
        throw new Error('Unauthorized: You can only view orders you placed or orders containing your products');
    }
    async updateOrderStatus(id, newStatus, userId) {
        const order = await prisma_1.prisma.order.findUnique({
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
        if (!order)
            throw new Error('Order not found');
        // Verify user is seller of any product in the order
        const isSeller = order.items.some(item => item.product.store?.userId === userId);
        if (!isSeller)
            throw new Error('Unauthorized: Only sellers can update order status');
        // Validate status transition using state machine
        const validNextStatuses = VALID_TRANSITIONS[order.status] || [];
        if (!validNextStatuses.includes(newStatus)) {
            throw new Error(`Invalid status transition: Cannot change from "${order.status}" to "${newStatus}". ` +
                `Valid next statuses are: ${validNextStatuses.join(', ') || 'none (terminal state)'}`);
        }
        return prisma_1.prisma.order.update({
            where: { id },
            data: { status: newStatus },
        });
    }
    async updateShipment(orderId, trackingNumber, courier) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order)
                throw new Error('Order not found');
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
    /**
     * Update shipment status and current location
     */
    async updateShipmentStatus(orderId, status, location) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { shipment: true }
            });
            if (!order)
                throw new Error('Order not found');
            if (!order.shipment)
                throw new Error('Shipment not found for this order');
            // Update shipment status and location
            await tx.shipment.update({
                where: { orderId },
                data: {
                    status,
                    currentLocation: location,
                    ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
                }
            });
            // Update order status if shipment is delivered
            const orderData = {};
            if (status === 'delivered') {
                orderData.status = 'completed';
            }
            else if (status === 'in_transit') {
                orderData.status = 'shipped';
            }
            if (Object.keys(orderData).length > 0) {
                return tx.order.update({
                    where: { id: orderId },
                    data: orderData,
                    include: { shipment: true }
                });
            }
            return tx.order.findUnique({
                where: { id: orderId },
                include: { shipment: true }
            });
        });
    }
    async cancelOrder(id, userId, reason) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
            }
        });
        if (!order)
            throw new Error('Order not found');
        // Verify authorization: Buyer or Seller
        const isBuyer = order.userId === userId;
        const isSeller = await this.isOrderSeller(order.id, userId);
        if (!isBuyer && !isSeller) {
            throw new Error('Unauthorized: Only buyers or sellers can cancel an order');
        }
        // Check if transition to cancelled is valid
        const validNextStatuses = VALID_TRANSITIONS[order.status] || [];
        if (!validNextStatuses.includes('cancelled')) {
            throw new Error(`Cannot cancel order in "${order.status}" status`);
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            // 1. If paid, handle refund (Mock)
            if (order.paymentStatus === 'paid') {
                await payment_service_1.paymentService.refundOrder(order.id);
            }
            // 2. Restore stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
            // 3. Update order status
            return tx.order.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
                    cancellationReason: reason,
                    cancelledAt: new Date(),
                    cancelledBy: isBuyer ? 'buyer' : 'seller'
                } // Use any because Prisma generate might have failed
            });
        });
    }
    async isOrderSeller(orderId, userId) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { store: true }
                        }
                    }
                }
            }
        });
        if (!order)
            return false;
        return order.items.some(item => item.product.store?.userId === userId || item.product.sellerId === userId);
    }
    async syncStock(productId) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new Error('Product not found');
        // In a real scenario, we would iterate over connected channels for this product/store
        // For now, we simulate syncing with both adapters
        // await shopeeAdapter.syncStock(productId, product.stock);
        // await tokopediaAdapter.syncStock(productId, product.stock);
        return {
            success: true,
            newStock: product.stock
        };
    }
    async getSellerAnalytics(userId) {
        const store = await prisma_1.prisma.store.findUnique({ where: { userId } });
        if (!store)
            throw new Error('Store not found');
        const totalOrders = await prisma_1.prisma.order.count({
            where: {
                items: {
                    some: {
                        product: {
                            OR: [
                                { storeId: store.id },
                                { sellerId: userId }
                            ]
                        }
                    }
                }
            }
        });
        const completedOrdersWithItems = await prisma_1.prisma.order.findMany({
            where: {
                status: 'completed',
                items: {
                    some: {
                        product: {
                            OR: [
                                { storeId: store.id },
                                { sellerId: userId }
                            ]
                        }
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        let totalSales = 0;
        completedOrdersWithItems.forEach(order => {
            order.items.forEach(item => {
                if (item.product.storeId === store.id || item.product.sellerId === userId) {
                    totalSales += Number(item.price) * item.quantity;
                }
            });
        });
        const products = await prisma_1.prisma.product.count({
            where: {
                OR: [
                    { storeId: store.id },
                    { sellerId: userId }
                ],
                deletedAt: null
            }
        });
        const recentOrders = await prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            OR: [
                                { storeId: store.id },
                                { sellerId: userId }
                            ]
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                user: { select: { fullName: true } },
                items: { include: { product: true } }
            }
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
    async getSellerOrders(userId) {
        const store = await prisma_1.prisma.store.findUnique({ where: { userId } });
        if (!store)
            return [];
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            OR: [
                                { storeId: store.id },
                                { sellerId: userId }
                            ]
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
                                sellerId: true,
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
        // Add seller-specific subtotal to each order
        return orders.map(order => {
            const sellerSubtotal = order.items.reduce((sum, item) => {
                if (item.product.storeId === store.id || item.product.sellerId === userId) {
                    return sum + (Number(item.price) * item.quantity);
                }
                return sum;
            }, 0);
            return {
                ...order,
                sellerSubtotal
            };
        });
    }
    async getAdminAnalytics() {
        const totalOrders = await prisma_1.prisma.order.count();
        const allSales = await prisma_1.prisma.order.aggregate({
            where: { paymentStatus: 'paid' }, // Only count PAID orders
            _sum: {
                totalAmount: true,
                platformFee: true
            }
        });
        const totalSales = Number(allSales._sum.totalAmount || 0);
        const totalFees = Number(allSales._sum.platformFee || 0);
        const activeStores = await prisma_1.prisma.store.count({
            where: { isActive: true }
        });
        const totalUsers = await prisma_1.prisma.user.count();
        const activeUsers = await prisma_1.prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }); // Active in last 30 days
        const pendingVerifications = await prisma_1.prisma.uMKMProfile.count({ where: { status: 'submitted' } });
        // Get User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const usersByMonth = await prisma_1.prisma.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sixMonthsAgo } },
            _count: { id: true },
        });
        // Process usersByMonth into a nice array for Recharts if needed, 
        // but for now let's just return the aggregates and let frontend format or format here.
        // Simplified mock-like return for the graph to ensure data shape matches frontend expectation
        const userGrowth = [
            { name: 'Jan', users: 0 },
            { name: 'Feb', users: 0 },
            { name: 'Mar', users: 0 },
            { name: 'Apr', users: 0 },
            { name: 'May', users: 0 },
            { name: 'Jun', users: 0 },
        ]; // TODO: Implement real aggregation mapping
        return {
            stats: {
                totalUsers,
                activeUsers,
                pendingVerifications,
                systemHealth: 100,
                totalOrders,
                totalSales,
                totalFees,
                activeStores
            },
            userGrowth
        };
    }
    /**
     * Approve a product listing
     */
    async approveProduct(id) {
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                status: 'active',
                isPublished: true,
                rejectionReason: null
            }
        });
    }
    /**
     * Reject a product listing
     */
    async rejectProduct(id, reason) {
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                status: 'rejected',
                isPublished: false,
                rejectionReason: reason
            }
        });
    }
    async getPendingProducts() {
        return prisma_1.prisma.product.findMany({
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
    async verifyProduct(id, approved) {
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                isPublished: approved,
                status: approved ? 'active' : 'rejected'
            }
        });
    }
    async findProductsByStore(storeId) {
        return prisma_1.prisma.product.findMany({
            where: { storeId, deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateProductStatus(id, userId, status) {
        return this.updateProduct(id, userId, { status });
    }
    async attachImagesToProduct(id, userId, newImages) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        const currentImages = Array.isArray(product.images) ? product.images : [];
        const updatedImages = [...currentImages, ...newImages];
        return prisma_1.prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });
    }
    async reorderProductImages(id, userId, images) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        return prisma_1.prisma.product.update({
            where: { id },
            data: { images }
        });
    }
    async setProductImageThumbnail(id, userId, imageUrl) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        let currentImages = Array.isArray(product.images) ? product.images : [];
        // Remove the image if it exists and unshift it to the front
        currentImages = currentImages.filter(img => img !== imageUrl);
        currentImages.unshift(imageUrl);
        return prisma_1.prisma.product.update({
            where: { id },
            data: { images: currentImages }
        });
    }
    async deleteProductImage(id, userId, imageUrl) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        if (product.sellerId !== userId)
            throw new Error('Unauthorized');
        const currentImages = Array.isArray(product.images) ? product.images : [];
        const updatedImages = currentImages.filter(img => img !== imageUrl);
        return prisma_1.prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });
    }
    async getCategories() {
        const categories = await prisma_1.prisma.product.groupBy({
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
        const topStores = await prisma_1.prisma.store.findMany({
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
                        umkmProfiles: {
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
            location: s.user?.umkmProfiles?.[0]?.city || 'Indramayu',
            products: s._count.products,
            rating: Number(s.rating) || 0,
            totalSales: String(s._count.orders),
            verified: s.isActive,
            image: s.logoUrl || s.user?.profilePictureUrl || '/api/placeholder/80/80'
        }));
    }
    async getConsultantClientsProducts(consultantId, params) {
        const { search, clientId, status, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null
        };
        // 1. Filter by Client (Store)
        if (clientId) {
            where.storeId = clientId;
        }
        else {
            // For now, consistent with "Mock" consultant features, we'll return products from ALL stores
            // In real implementation:
            // const clients = await consultationService.getClients(consultantId);
            // where.storeId = { in: clients.map(c => c.storeId) };
        }
        // 2. Search
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        // 3. Status Filter
        if (status) {
            if (status === 'active')
                where.isPublished = true;
            else if (status === 'draft')
                where.status = 'draft';
            else if (status === 'inactive')
                where.isPublished = false;
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            user: {
                                select: { fullName: true }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getExportReadyProducts(params) {
        const { page = 1, limit = 10, category, region } = params;
        const skip = (page - 1) * limit;
        const where = {
            isPublished: true,
            deletedAt: null,
            // Mock criteria for "Export Ready": Rating > 4.5 OR expensive items
            OR: [
                { price: { gt: 500000 } }, // Expensive items assumed high quality
                // Real implementation would have a specific flag or score
            ]
        };
        if (category)
            where.category = category;
        if (region) {
            where.store = {
                user: {
                    umkmProfiles: {
                        some: { city: { contains: region, mode: 'insensitive' } }
                    }
                }
            };
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            user: {
                                select: {
                                    umkmProfiles: { select: { city: true } }
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { price: 'desc' }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getFinancingCandidates(params) {
        const { page = 1, limit = 10, minRevenue = 1000000, location } = params;
        const skip = (page - 1) * limit;
        // Find stores with orders sum > minRevenue
        // This is complex with simple findMany, so we use groupBy or just fetch top stores
        // For MVP, we'll fetch active stores and filter in memory or use the topSellers logic
        const where = {
            isActive: true
        };
        if (location) {
            where.user = {
                umkmProfiles: {
                    some: { city: { contains: location, mode: 'insensitive' } }
                }
            };
        }
        const [stores, total] = await Promise.all([
            prisma_1.prisma.store.findMany({
                where,
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true,
                            umkmProfiles: { select: { city: true } }
                        }
                    },
                    _count: {
                        select: { orders: true }
                    }
                },
                skip,
                take: limit,
                // approximating "revenue" by order count for sorting, ideal is Aggregation
                orderBy: {
                    orders: { _count: 'desc' }
                }
            }),
            prisma_1.prisma.store.count({ where })
        ]);
        return {
            candidates: stores.map(s => ({
                id: s.id,
                name: s.name,
                owner: s.user?.fullName,
                location: s.user?.umkmProfiles?.[0]?.city || 'Indramayu',
                orderCount: s._count.orders,
                // Mock revenue
                estimatedRevenue: s._count.orders * 150000, // Avg order value assumption
                status: 'Eligible'
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.MarketplaceService = MarketplaceService;

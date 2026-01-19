"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marketplace_service_1 = require("../systems/marketplace/services/marketplace.service");
const prisma_1 = require("../lib/prisma");
const service = new marketplace_service_1.MarketplaceService();
async function main() {
    console.log('--- Starting Payment Flow Verification ---');
    // 1. Setup User and Product
    const user = await prisma_1.prisma.user.findFirst();
    if (!user) {
        console.error('No user found');
        return;
    }
    const product = await prisma_1.prisma.product.findFirst({
        where: { stock: { gt: 10 } }
    });
    if (!product) {
        console.error('No product with stock found');
        return;
    }
    console.log(`Using User: ${user.email}`);
    console.log(`Using Product: ${product.title} (Stock: ${product.stock})`);
    // 2. Create Order
    console.log('\n--- 1. Testing Create Order ---');
    const order = await service.createOrder(user.id, [{ productId: product.id, quantity: 1 }], { address: 'Test Address' }, 'JNE', 15000);
    console.log(`Order Created: ${order.id}`);
    console.log(`Status: ${order.status}`);
    console.log(`Expiry: ${order.expiryTime}`);
    if (order.status !== 'pending_payment')
        console.error('FAIL: Status should be pending_payment');
    if (!order.expiryTime)
        console.error('FAIL: Expiry time not set');
    // 3. Test Pay Success
    console.log('\n--- 2. Testing Payment Success ---');
    const order2 = await service.createOrder(user.id, [{ productId: product.id, quantity: 1 }], { address: 'Test Address 2' }, 'JNE', 15000);
    await service.processPayment(order2.id, 'success');
    const updatedOrder2 = await prisma_1.prisma.order.findUnique({ where: { id: order2.id } });
    console.log(`Order 2 Status: ${updatedOrder2?.status}`);
    if (updatedOrder2?.status !== 'paid')
        console.error('FAIL: Order 2 should be paid');
    // 4. Test Expiry
    console.log('\n--- 3. Testing Expiry Logic ---');
    const order3 = await service.createOrder(user.id, [{ productId: product.id, quantity: 1 }], { address: 'Test Address 3' }, 'JNE', 15000);
    // Manually expire it
    await prisma_1.prisma.order.update({
        where: { id: order3.id },
        data: { expiryTime: new Date(Date.now() - 1000) } // 1 second ago
    });
    console.log('Checking for expired orders...');
    await service.checkExpiredOrders();
    const updatedOrder3 = await prisma_1.prisma.order.findUnique({ where: { id: order3.id } });
    console.log(`Order 3 Status: ${updatedOrder3?.status}`);
    console.log(`Order 3 Reason: ${updatedOrder3?.cancellationReason}`);
    if (updatedOrder3?.status !== 'cancelled')
        console.error('FAIL: Order 3 should be cancelled');
    console.log('\n--- Verification Complete ---');
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});

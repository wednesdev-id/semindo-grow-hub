"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
class MockPaymentGateway {
    async createPaymentLink(order, user) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const paymentLink = `https://payment.sinergiumkm.com/pay/${paymentId}?amount=${order.totalAmount}`;
        return { paymentLink, paymentId };
    }
    async verifyPayment(paymentId) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Randomly return success or pending for mock
        return Math.random() > 0.2 ? 'paid' : 'pending';
    }
}
exports.paymentService = new MockPaymentGateway();

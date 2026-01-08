import { Order } from '@prisma/client';

export interface PaymentGateway {
    createPaymentLink(order: Order, user: { name: string; email: string }): Promise<{ paymentLink: string; paymentId: string }>;
    verifyPayment(paymentId: string): Promise<string>; // Returns status
}

class MockPaymentGateway implements PaymentGateway {
    async createPaymentLink(order: Order, user: { name: string; email: string }): Promise<{ paymentLink: string; paymentId: string }> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const paymentLink = `https://payment.sinergiumkm.com/pay/${paymentId}?amount=${order.totalAmount}`;

        return { paymentLink, paymentId };
    }

    async verifyPayment(paymentId: string): Promise<string> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Randomly return success or pending for mock
        return Math.random() > 0.2 ? 'paid' : 'pending';
    }
}

export const paymentService = new MockPaymentGateway();

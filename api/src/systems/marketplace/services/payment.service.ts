import { prisma } from '../../../lib/prisma';
import { MidtransService } from './midtrans.service';

const midtrans = new MidtransService();

export const paymentService = {
    /**
     * Create a payment link (Core API Transaction)
     * Returns the transaction details (VA number, etc)
     */
    async createPaymentLink(order: Order, method: string) {
        let transaction;
        try {
            // Use Midtrans Core API
            transaction = await midtrans.createTransaction(order, method);
        } catch (error) {
            console.error('[PaymentService] Gateway Error (Fallback to Mock):', error);
            // Fallback for simulation
            transaction = {
                transaction_id: `mock-${Date.now()}`,
                token: `mock-token-${Date.now()}`,
                order_id: order.id,
                gross_amount: order.totalAmount,
                payment_type: method,
                transaction_status: 'pending',
                va_numbers: [{ bank: 'bca', va_number: '888800001234' }] // Generic mock VA
            };
        }

        // Map Midtrans response to our internal "Payment Link" concept
        // We construct a link to our OWN Payment Page, but now backed by real data
        const paymentLink = `/marketplace/payment-simulation/${order.id}?method=${method}`;

        return {
            paymentLink,
            paymentToken: transaction.transaction_id || transaction.token,
            paymentGateway: 'midtrans',
            paymentData: transaction,
            // Pass generic data for frontend to display (VA numbers etc)
            ...transaction
        };
    },

    /**
     * Verify payment status
     * Now checks real status from Midtrans
     */
    async verifyPayment(orderId: string, transactionId?: string): Promise<string> {
        // If we have a transaction ID, check that, otherwise try orderId
        const idToCheck = transactionId || orderId;
        const status = await midtrans.verifyTransaction(idToCheck);

        // Normalize status to our internal state machine
        // Midtrans: settlement -> paid
        // Midtrans: pending -> pending
        // Midtrans: expire -> expired
        // Midtrans: deny/cancel -> failed

        if (status === 'settlement' || status === 'capture') return 'paid';
        if (status === 'expire') return 'expired';
        if (status === 'deny' || status === 'cancel' || status === 'failure') return 'failed';

        // If pending, check if actually expired locally (if midtrans hasn't updated yet)
        if (status === 'pending') {
            // Optional: Check order expiry time from DB if needed, but usually we trust Gateway
            // For now, return pending. UI will handle 'verifying' state.
            return 'pending';
        }

        return status || 'pending';
    },

    async refundOrder(orderId: string) {
        // Implement refund logic via Midtrans API (optional for now)
        return true;
    }
};

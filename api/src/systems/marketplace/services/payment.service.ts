import { PrismaClient, Order } from '@prisma/client';
import { MidtransService } from './midtrans.service';

const prisma = new PrismaClient();
const midtrans = new MidtransService();

export const paymentService = {
    /**
     * Create a payment link (Core API Transaction)
     * Returns the transaction details (VA number, etc)
     */
    async createPaymentLink(order: Order, method: string) {
        // Use Midtrans Core API
        const transaction = await midtrans.createTransaction(order, method);

        // Save token/transaction ID AND full paymentData
        await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentToken: transaction.transaction_id || transaction.token,
                paymentGateway: 'midtrans',
                paymentData: transaction // Save full response (VA numbers, etc)
            }
        });

        // Map Midtrans response to our internal "Payment Link" concept if needed,
        // OR just return the data to be displayed by Frontend
        // For Core API, we return the whole object so the frontend can display VA numbers
        // We construct a link to our OWN Payment Page, but now backed by real data
        const paymentLink = `/marketplace/payment-simulation/${order.id}?method=${method}`;

        return {
            paymentLink,
            paymentId: transaction.transaction_id,
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

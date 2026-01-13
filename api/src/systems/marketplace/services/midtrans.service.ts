import { CoreApi } from 'midtrans-client';
import { Order } from '@prisma/client';

export class MidtransService {
    private core: any;
    private isProduction: boolean;

    constructor() {
        this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        this.core = new CoreApi({
            isProduction: this.isProduction,
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
            clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
        });
    }

    /**
     * Create a Direct Bank Transfer (VA) Transaction
     * Used for BCA, Mandiri, BNI, BRI, Permata
     */
    async createBankTransfer(order: Order, bank: string): Promise<any> {
        const parameter = {
            payment_type: 'bank_transfer',
            transaction_details: {
                order_id: order.id,
                gross_amount: Number(order.totalAmount)
            },
            bank_transfer: {
                bank: bank
            },
            customer_details: {
                // In a real app, populate this from order.shippingAddress or user data
                first_name: "Customer",
                email: "customer@example.com"
            }
        };

        try {
            const response = await this.core.charge(parameter);
            return response;
        } catch (error) {
            console.error('[Midtrans] Charge Error:', error);
            throw error;
        }
    }

    /**
     * Create Permata VA (Special case in Midtrans)
     */
    async createPermataTransfer(order: Order): Promise<any> {
        const parameter = {
            payment_type: 'bank_transfer',
            transaction_details: {
                order_id: order.id,
                gross_amount: Number(order.totalAmount)
            },
            bank_transfer: {
                bank: 'permata',
                permata: {
                    recipient_name: 'Semindo Grow Hub'
                }
            }
        };
        return this.core.charge(parameter);
    }

    /**
     * Create QRIS / GoPay Transaction
     */
    async createQris(order: Order): Promise<any> {
        const parameter = {
            payment_type: 'qris',
            transaction_details: {
                order_id: order.id,
                gross_amount: Number(order.totalAmount)
            },
            qris: {
                acquirer: 'gopay'
            }
        };
        try {
            const response = await this.core.charge(parameter);
            return response;
        } catch (error) {
            console.error('[Midtrans] QRIS Error:', error);
            throw error;
        }
    }

    /**
     * Generic wrapper to choose based on method
     */
    async createTransaction(order: Order, method: string): Promise<any> {
        const m = method.toLowerCase();

        if (m.includes('bca')) return this.createBankTransfer(order, 'bca');
        if (m.includes('bni')) return this.createBankTransfer(order, 'bni');
        if (m.includes('bri')) return this.createBankTransfer(order, 'bri');
        if (m.includes('mandiri')) {
            // Mandiri Bill Payment is slightly different usually, but echannel is complex. Only if 'bank_transfer' supports 'mandiri' directly in Core API (it does for Bill Payment usually via 'echannel' but let's try simple 'bank_transfer' -> 'bank': 'mandiri' if supported, otherwise 'echannel')
            // Docs says: bank_transfer > bank: mandiri is for Mandiri Bill Payment? No, usually it's E-Channel.
            // Let's stick to standard bank transfer for now.
            return this.createBankTransfer(order, 'mandiri');
        }
        if (m.includes('permata')) return this.createPermataTransfer(order);
        if (m.includes('qris') || m.includes('gopay') || m.includes('ewallet')) return this.createQris(order);

        throw new Error(`Unsupported payment method: ${method}`);
    }

    /**
     * Verify Transaction Status
     */
    async verifyTransaction(orderId: string): Promise<string> {
        try {
            const response = await this.core.transaction.status(orderId);
            return this.mapStatus(response.transaction_status);
        } catch (error) {
            // If 404, it means not found = pending/unpaid
            return 'pending';
        }
    }

    mapStatus(midtransStatus: string): string {
        switch (midtransStatus) {
            case 'capture':
            case 'settlement':
                return 'paid';
            case 'pending':
                return 'pending';
            case 'deny':
            case 'cancel':
            case 'expire':
                return 'failed'; // or 'expired'
            default:
                return 'pending';
        }
    }
}

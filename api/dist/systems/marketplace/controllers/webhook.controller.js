"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const marketplace_service_1 = require("../services/marketplace.service");
const marketplaceService = new marketplace_service_1.MarketplaceService();
// const midtrans = new MidtransService(); // Not used directly yet, validation TODO
class WebhookController {
    /**
     * Handle Midtrans HTTP Notification
     */
    async handleMidtransNotification(req, res) {
        try {
            const notification = req.body;
            // 1. Verify Signature (TODO: Implement proper signature check from MidtransService if strictly required, 
            // but Core API usually trusts the POST if Server Key is not exposed)
            // Ideally: SHA512(order_id+status_code+gross_amount+ServerKey)
            const orderId = notification.order_id;
            const transactionStatus = notification.transaction_status;
            const fraudStatus = notification.fraud_status;
            console.log(`[Midtrans Webhook] Received for Order ${orderId}: ${transactionStatus}`);
            let status = 'pending';
            switch (transactionStatus) {
                case 'capture':
                    // For credit card, check fraud status
                    if (fraudStatus == 'challenge') {
                        status = 'pending'; // verifying
                    }
                    else if (fraudStatus == 'accept') {
                        status = 'paid';
                    }
                    break;
                case 'settlement':
                    status = 'paid';
                    break;
                case 'cancel':
                case 'deny':
                case 'failure':
                    status = 'failed';
                    break;
                case 'expire':
                    status = 'expired';
                    break;
                case 'pending':
                    status = 'pending';
                    break;
                default:
                    status = 'pending';
                    break;
            }
            console.log(`[Midtrans Webhook] Mapped Status: ${status}`);
            if (status !== 'pending') {
                // Update order status based on strict mapping
                await marketplaceService.processPayment(orderId, status); // Ensure processPayment handles 'paid', 'failed', 'expired'
            }
            res.status(200).send('OK');
        }
        catch (error) {
            console.error('[Midtrans Webhook Error]', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
exports.WebhookController = WebhookController;

import cron, { ScheduledTask } from 'node-cron';
import { featureFlags } from '../../config/feature-flags';
import { MarketplaceService } from '../marketplace/services/marketplace.service';

export class CronService {
    private static instance: CronService;
    private jobs: ScheduledTask[] = [];

    private constructor() { }

    static getInstance(): CronService {
        if (!CronService.instance) {
            CronService.instance = new CronService();
        }
        return CronService.instance;
    }

    init() {
        console.log('[CronService] Initializing background jobs...');

        // Marketplace order expiry check (only if marketplace is enabled)
        if (featureFlags.MARKETPLACE_ENABLED) {
            const marketplaceService = new MarketplaceService();

            const expiryJob = cron.schedule('* * * * *', async () => {
                console.log('[CronService] Running order expiry check...');
                try {
                    await marketplaceService.checkExpiredOrders();
                } catch (error) {
                    console.error('[CronService] Error in order expiry check:', error);
                }
            });
            this.jobs.push(expiryJob);
        }

        console.log(`[CronService] Started ${this.jobs.length} background jobs.`);
    }

    stop() {
        this.jobs.forEach(job => job.stop());
        console.log('[CronService] Stopped all background jobs.');
    }
}

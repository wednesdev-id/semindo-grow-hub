"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const marketplace_service_1 = require("../marketplace/services/marketplace.service");
const marketplaceService = new marketplace_service_1.MarketplaceService();
class CronService {
    constructor() {
        this.jobs = [];
    }
    static getInstance() {
        if (!CronService.instance) {
            CronService.instance = new CronService();
        }
        return CronService.instance;
    }
    init() {
        console.log('[CronService] Initializing background jobs...');
        // Job 1: Check for expired orders every 1 minute
        // Cron expression: * * * * * (every minute)
        const expiryJob = node_cron_1.default.schedule('* * * * *', async () => {
            console.log('[CronService] Running order expiry check...');
            try {
                await marketplaceService.checkExpiredOrders();
            }
            catch (error) {
                console.error('[CronService] Error in order expiry check:', error);
            }
        });
        this.jobs.push(expiryJob);
        console.log(`[CronService] Started ${this.jobs.length} background jobs.`);
    }
    stop() {
        this.jobs.forEach(job => job.stop());
        console.log('[CronService] Stopped all background jobs.');
    }
}
exports.CronService = CronService;

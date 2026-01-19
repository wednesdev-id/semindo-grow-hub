"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = require("./server");
const port = Number(process.env.PORT || 3000);
const app = (0, server_1.createServer)();
const db_1 = require("./systems/utils/db");
app.listen(port, async () => {
    console.log(`[API] Server running on port ${port}`);
    console.log(`[API] Environment: ${process.env.NODE_ENV || 'development'}`);
    try {
        await db_1.db.$connect();
        console.log('[API] Database connection successful');
    }
    catch (error) {
        console.error('[API] Database connection failed:', error);
    }
});

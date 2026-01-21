"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const server_1 = require("./server");
const chat_gateway_1 = require("./systems/consultation/gateway/chat.gateway");
const port = Number(process.env.PORT || 3000);
const app = (0, server_1.createServer)();
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.io Chat Gateway
const chatGateway = new chat_gateway_1.ConsultationChatGateway(httpServer);
console.log('[API] Socket.io Chat Gateway initialized');
const db_1 = require("./systems/utils/db");
httpServer.listen(port, async () => {
    console.log(`[API] Server running on port ${port}`);
    console.log(`[API] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[API] Socket.io path: /consultation-chat`);
    try {
        await db_1.db.$connect();
        console.log('[API] Database connection successful');
    }
    catch (error) {
        console.error('[API] Database connection failed:', error);
    }
});

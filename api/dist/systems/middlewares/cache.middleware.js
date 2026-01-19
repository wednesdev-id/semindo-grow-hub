"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheInstance = exports.clearCache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 }); // 5 minutes default TTL
const cacheMiddleware = (duration = 300) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        return res.send(cachedResponse);
    }
    else {
        // Override res.send to cache the response
        const originalSend = res.send;
        res.send = (body) => {
            cache.set(key, body, duration);
            return originalSend.call(res, body);
        };
        next();
    }
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = (key) => {
    cache.del(key);
};
exports.clearCache = clearCache;
exports.cacheInstance = cache;

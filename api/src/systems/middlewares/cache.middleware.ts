
import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export const cacheMiddleware = (duration: number = 300) => (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.send(cachedResponse);
    } else {
        // Override res.send to cache the response
        const originalSend = res.send;
        res.send = (body) => {
            cache.set(key, body, duration);
            return originalSend.call(res, body);
        };
        next();
    }
};

export const clearCache = (key: string) => {
    cache.del(key);
};

export const cacheInstance = cache;

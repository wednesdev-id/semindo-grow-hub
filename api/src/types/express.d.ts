import { ParamsDictionary } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
    interface Request {
        // Override params to always be string (not string | string[])
        params: ParamsDictionary;
    }
}

// Extend Request to include authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                roles?: string[];
            };
        }
    }
}

export { };

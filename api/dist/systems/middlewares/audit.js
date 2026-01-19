"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = auditMiddleware;
function auditMiddleware(req, _res, next) {
    const start = process.hrtime.bigint();
    req.on('close', () => {
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1000000;
        // no comments
        process.stdout.write(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${ms.toFixed(1)}ms\n`);
    });
    next();
}

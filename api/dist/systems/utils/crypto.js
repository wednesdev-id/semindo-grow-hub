"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
const crypto_1 = __importDefault(require("crypto"));
function aesEncrypt(plain, key) {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), iv);
    let enc = cipher.update(plain, 'utf8', 'base64');
    enc += cipher.final('base64');
    return `${iv.toString('base64')}.${enc}`;
}
function aesDecrypt(enc, key) {
    const [ivb64, data] = enc.split('.');
    const iv = Buffer.from(ivb64, 'base64');
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), iv);
    let dec = decipher.update(data, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

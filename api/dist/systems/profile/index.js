"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRouter = exports.profileRouter = void 0;
const profile_routes_1 = require("./routes/profile.routes");
Object.defineProperty(exports, "profileRouter", { enumerable: true, get: function () { return profile_routes_1.profileRouter; } });
const document_routes_1 = __importDefault(require("./routes/document.routes"));
exports.documentRouter = document_routes_1.default;

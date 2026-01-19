"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const db_1 = require("../../utils/db");
class TemplateService {
    static async getTemplates(isActive = true) {
        return db_1.db.assessmentTemplate.findMany({
            where: { isActive },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    static async getTemplateById(id) {
        return db_1.db.assessmentTemplate.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        category: true
                    }
                }
            }
        });
    }
    static async getTemplatesByCategory(category, isActive = true) {
        return db_1.db.assessmentTemplate.findMany({
            where: {
                isActive,
                category
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    static async getDefaultTemplate() {
        return db_1.db.assessmentTemplate.findFirst({
            where: { isActive: true }
        });
    }
}
exports.TemplateService = TemplateService;

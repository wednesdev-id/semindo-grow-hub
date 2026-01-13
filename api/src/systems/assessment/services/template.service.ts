
import { db } from '../../utils/db';

export class TemplateService {
    static async getTemplates(isActive: boolean = true) {
        return db.assessmentTemplate.findMany({
            where: { isActive },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }

    static async getTemplateById(id: string) {
        return db.assessmentTemplate.findUnique({
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

    static async getTemplatesByCategory(category: string, isActive: boolean = true) {
        return db.assessmentTemplate.findMany({
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
        return db.assessmentTemplate.findFirst({
            where: { isActive: true }
        });
    }
}

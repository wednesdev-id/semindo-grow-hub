
import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../types/users.types';
import { BulkOperationsService } from '../services/bulkOperations.service';
import { ImportExportService } from '../services/importExport.service';

const usersService = new UsersService();
const bulkOpsService = new BulkOperationsService();
const importExportService = new ImportExportService();

export class UsersController {
    async findAll(req: Request, res: Response) {
        try {
            const result = await usersService.findAll(req.query)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const result = await usersService.findById(req.params.id)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message })
        }
    }

    async create(req: Request, res: Response) {
        try {
            const result = await usersService.create(req.body)
            res.status(201).json({ success: true, data: result })
        } catch (error: any) {
            console.error('Error creating user:', error)
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async update(req: Request, res: Response) {
        try {
            const result = await usersService.update(req.params.id, req.body)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await usersService.delete(req.params.id)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Profile Management Methods
    async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id // From auth middleware
            const result = await usersService.getCurrentUser(userId)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message })
        }
    }

    async updateOwnProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id
            const result = await usersService.updateOwnProfile(userId, req.body)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id
            const { oldPassword, newPassword } = req.body

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Old password and new password are required'
                })
            }

            const result = await usersService.changePassword(userId, oldPassword, newPassword)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async uploadProfilePicture(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                })
            }

            const { processProfilePicture, getPublicUrl } = await import('../../utils/upload.service')

            // Process the uploaded image
            const processedPath = await processProfilePicture(req.file.path)
            const publicUrl = getPublicUrl(processedPath)

            // Update user profile
            const result = await usersService.updateProfilePicture(userId, publicUrl)

            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // User-Role Management Methods
    async assignRoles(req: Request, res: Response) {
        try {
            const { roleIds } = req.body

            if (!roleIds || !Array.isArray(roleIds)) {
                return res.status(400).json({
                    success: false,
                    error: 'roleIds must be an array'
                })
            }

            const result = await usersService.assignRoles(req.params.id, roleIds)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async removeRole(req: Request, res: Response) {
        try {
            const result = await usersService.removeRole(req.params.id, req.params.roleId)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Bulk Operations
    async bulkDelete(req: Request, res: Response) {
        try {
            const { userIds } = req.body;
            const performedBy = (req as any).user?.id;
            const result = await bulkOpsService.bulkDelete(userIds, performedBy);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async bulkActivate(req: Request, res: Response) {
        try {
            const { userIds } = req.body;
            const performedBy = (req as any).user?.id;
            const result = await bulkOpsService.bulkActivate(userIds, performedBy);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async bulkDeactivate(req: Request, res: Response) {
        try {
            const { userIds } = req.body;
            const performedBy = (req as any).user?.id;
            const result = await bulkOpsService.bulkDeactivate(userIds, performedBy);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async bulkAssignRoles(req: Request, res: Response) {
        try {
            const { userIds, roleIds } = req.body;
            const performedBy = (req as any).user?.id;
            const result = await bulkOpsService.bulkAssignRoles(userIds, roleIds, performedBy);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Import/Export
    async exportUsers(req: Request, res: Response) {
        try {
            const csv = await importExportService.exportToCSV(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
            res.send(csv);
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async downloadTemplate(req: Request, res: Response) {
        try {
            const csv = await importExportService.generateTemplate();
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users-template.csv');
            res.send(csv);
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async validateImport(req: Request, res: Response) {
        try {
            const csvContent = req.body.csvContent;
            const rows = importExportService.parseCSV(csvContent);
            const validation = await importExportService.validateImportData(rows);
            res.json({ success: true, data: validation });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async importUsers(req: Request, res: Response) {
        try {
            const csvContent = req.body.csvContent;
            const performedBy = (req as any).user?.id;
            const rows = importExportService.parseCSV(csvContent);
            const result = await importExportService.importUsers(rows, performedBy);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

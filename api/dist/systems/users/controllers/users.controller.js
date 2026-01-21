"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("../services/users.service");
const bulkOperations_service_1 = require("../services/bulkOperations.service");
const importExport_service_1 = require("../services/importExport.service");
const usersService = new users_service_1.UsersService();
const bulkOpsService = new bulkOperations_service_1.BulkOperationsService();
const importExportService = new importExport_service_1.ImportExportService();
class UsersController {
    async findAll(req, res) {
        try {
            const result = await usersService.findAll(req.query);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const result = await usersService.findById(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async create(req, res) {
        try {
            const result = await usersService.create(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const result = await usersService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const result = await usersService.delete(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // Profile Management Methods
    async getCurrentUser(req, res) {
        try {
            const userId = req.user.id; // From auth middleware
            const result = await usersService.getCurrentUser(userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async updateOwnProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await usersService.updateOwnProfile(userId, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Old password and new password are required'
                });
            }
            const result = await usersService.changePassword(userId, oldPassword, newPassword);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async uploadProfilePicture(req, res) {
        try {
            const userId = req.user.id;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            const { processProfilePicture, getPublicUrl } = await Promise.resolve().then(() => __importStar(require('../../utils/upload.service')));
            // Process the uploaded image
            const processedPath = await processProfilePicture(req.file.path);
            const publicUrl = getPublicUrl(processedPath);
            // Update user profile
            const result = await usersService.updateProfilePicture(userId, publicUrl);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // User-Role Management Methods
    async assignRoles(req, res) {
        try {
            const { roleIds } = req.body;
            if (!roleIds || !Array.isArray(roleIds)) {
                return res.status(400).json({
                    success: false,
                    error: 'roleIds must be an array'
                });
            }
            const result = await usersService.assignRoles(req.params.id, roleIds);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async removeRole(req, res) {
        try {
            const result = await usersService.removeRole(req.params.id, req.params.roleId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // Bulk Operations
    async bulkDelete(req, res) {
        try {
            const { userIds } = req.body;
            const performedBy = req.user?.id;
            const result = await bulkOpsService.bulkDelete(userIds, performedBy);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async bulkActivate(req, res) {
        try {
            const { userIds } = req.body;
            const performedBy = req.user?.id;
            const result = await bulkOpsService.bulkActivate(userIds, performedBy);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async bulkDeactivate(req, res) {
        try {
            const { userIds } = req.body;
            const performedBy = req.user?.id;
            const result = await bulkOpsService.bulkDeactivate(userIds, performedBy);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async bulkAssignRoles(req, res) {
        try {
            const { userIds, roleIds } = req.body;
            const performedBy = req.user?.id;
            const result = await bulkOpsService.bulkAssignRoles(userIds, roleIds, performedBy);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // Import/Export
    async exportUsers(req, res) {
        try {
            const csv = await importExportService.exportToCSV(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async downloadTemplate(req, res) {
        try {
            const csv = await importExportService.generateTemplate();
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users-template.csv');
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async validateImport(req, res) {
        try {
            const csvContent = req.body.csvContent;
            const rows = importExportService.parseCSV(csvContent);
            const validation = await importExportService.validateImportData(rows);
            res.json({ success: true, data: validation });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async importUsers(req, res) {
        try {
            const csvContent = req.body.csvContent;
            const performedBy = req.user?.id;
            const rows = importExportService.parseCSV(csvContent);
            const result = await importExportService.importUsers(rows, performedBy);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.UsersController = UsersController;

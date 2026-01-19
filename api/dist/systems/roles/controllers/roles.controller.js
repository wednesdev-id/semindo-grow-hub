"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesController = void 0;
const roles_service_1 = require("../services/roles.service");
const rolesService = new roles_service_1.RolesService();
class RolesController {
    async findAll(req, res) {
        try {
            const result = await rolesService.findAll();
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const result = await rolesService.findById(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async create(req, res) {
        try {
            const result = await rolesService.create(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const result = await rolesService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const result = await rolesService.delete(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getUsersByRole(req, res) {
        try {
            const result = await rolesService.getUsersByRole(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async getRolePermissions(req, res) {
        try {
            const result = await rolesService.getRolePermissions(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async assignPermissions(req, res) {
        try {
            const { permissionIds } = req.body;
            const result = await rolesService.assignPermissions(req.params.id, permissionIds);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async removePermission(req, res) {
        try {
            const result = await rolesService.removePermission(req.params.id, req.params.permissionId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.RolesController = RolesController;
